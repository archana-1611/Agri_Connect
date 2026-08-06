import express from 'express';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { supabasePublic } from '../middleware/auth.js';
import dns from 'dns';
import { promisify } from 'util';

// Force Node.js to prioritize IPv4 over IPv6 when resolving addresses
// This resolves the ENETUNREACH error on networks with incomplete IPv6 setups
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const dnsLookup = promisify(dns.lookup);

// Helper function to resolve host to IPv4 and create a secure nodemailer transporter
async function createMailTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  let resolvedHost = smtpHost;

  try {
    // Force IPv4 lookup for smtp.gmail.com to bypass local network IPv6 routing errors
    if (smtpHost === 'smtp.gmail.com') {
      const result = await dnsLookup(smtpHost, { family: 4 });
      resolvedHost = result.address;
      console.log(`Resolved smtp.gmail.com to IPv4 address: ${resolvedHost}`);
    }
  } catch (err) {
    console.warn(`IPv4 DNS lookup failed for ${smtpHost}, falling back to default resolution:`, err.message);
  }

  return nodemailer.createTransport({
    host: resolvedHost,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT || '465') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      servername: smtpHost // Ensures certificate verification matches the domain
    }
  });
}

const router = express.Router();

// Initialize Supabase Admin client if service role key is provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  let { email, redirectTo } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email or Mobile Number is required' });
  }

  email = email.trim();
  const targetRedirectUrl = redirectTo || 'http://localhost:5173/reset-password';

  try {
    // If input is a 10-digit phone number, lookup profile to get registered email
    if (!email.includes('@') && /^\d{10}$/.test(email)) {
      if (supabaseAdmin) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('phone', email)
          .maybeSingle();

        if (profile) {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
          if (userData && userData.user && userData.user.email) {
            email = userData.user.email;
          } else {
            email = `${email}@agriconnect.local`;
          }
        } else {
          email = `${email}@agriconnect.local`;
        }
      } else {
        email = `${email}@agriconnect.local`;
      }
    }

    // Check if SMTP configurations and service key are available
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (supabaseAdmin && hasSmtpConfig) {
      console.log(`Using custom SMTP and Supabase Admin to send reset link to: ${email}`);
      
      // Generate password reset recovery link using admin API
      let data, linkError;
      try {
        const result = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo: targetRedirectUrl
          }
        });
        data = result.data;
        linkError = result.error;
      } catch (err) {
        linkError = err;
      }

      if (linkError) {
        const errStr = (linkError.message || '').toLowerCase();
        if (errStr.includes('not found') || linkError.status === 404 || linkError.status === 422) {
          return res.status(400).json({ error: 'No registered user found with this email address. Please check and try again.' });
        }
        throw linkError;
      }

      const resetLink = data.properties.action_link;

      // Configure nodemailer transporter using IPv4 DNS resolution helper
      const transporter = await createMailTransporter();

      // Send mail
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@agriconnect.local',
        to: email,
        subject: 'Reset your AgriConnect Password / கடவுச்சொல்லை மீட்டமைக்கவும்',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2e7d32;">
              <h2 style="color: #2e7d32; margin: 0; font-size: 24px;">AgriConnect / உழவர்வளம்</h2>
              <p style="color: #64748b; font-style: italic; margin: 6px 0 0 0; font-size: 14px;">Smart Agricultural Resource Management</p>
            </div>
            <p style="font-size: 16px; color: #1e293b;">Hello,</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              We received a request to reset the password for your AgriConnect account registered under <strong>${email}</strong>. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background-color: #2e7d32; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(46, 125, 50, 0.25);">Reset Password / கடவுச்சொல்லை மாற்று</a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              If the button doesn't work, copy and paste this URL into your web browser:<br/>
              <a href="${resetLink}" style="color: #2e7d32; word-break: break-all;">${resetLink}</a>
            </p>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">AgriConnect Inc. Coimbatore, Tamil Nadu, India</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return res.json({ message: 'Password reset link sent successfully to your registered email address!' });
    } else {
      // Fallback: Use standard Supabase Client reset password email flow
      console.log(`SMTP/Admin key not fully configured. Falling back to Supabase native email reset for: ${email}`);
      const { error } = await supabasePublic.auth.resetPasswordForEmail(email, {
        redirectTo: targetRedirectUrl,
      });

      if (error) throw error;
      return res.json({ message: 'Password reset link sent successfully to your registered email address!' });
    }
  } catch (err) {
    console.error('Error in forgot-password:', err);
    res.status(500).json({ error: err.message || 'Failed to send password reset email' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, options } = req.body;
  const { full_name, role, district, phone } = options?.data || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (supabaseAdmin) {
      if (hasSmtpConfig) {
        console.log(`Registering user via Supabase Admin (with SMTP verification): ${email}`);
        
        // 1. Create user in Supabase with confirm = false
        let userData;
        try {
          const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: {
              full_name,
              role,
              district,
              location: district,
              phone
            }
          });

          if (createError) throw createError;
          userData = data;
        } catch (createError) {
          if (createError.status === 422 || createError.code === 'email_exists' || createError.message.includes('already been registered')) {
            console.log(`User ${email} already exists. Attempting to resend verification link instead.`);
          } else {
            throw createError;
          }
        }

        console.log(`Generating signup verification link for: ${email}`);
        
        // 2. Generate signup verification link
        let verificationLink;
        try {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email,
            options: {
              redirectTo: 'http://localhost:5173/auth'
            }
          });

          if (linkError) throw linkError;
          verificationLink = linkData.properties.action_link;
        } catch (linkError) {
          if (linkError.message.toLowerCase().includes('confirmed') || linkError.message.toLowerCase().includes('verified')) {
            return res.status(400).json({ 
              error: 'EMAIL_ALREADY_CONFIRMED', 
              message: 'This email is already verified. Please log in directly.' 
            });
          }
          throw linkError;
        }

        // 3. Configure nodemailer transporter using IPv4 DNS resolution helper
        const transporter = await createMailTransporter();

        // 4. Send email
        const mailOptions = {
          from: process.env.SMTP_FROM || 'noreply@agriconnect.local',
          to: email,
          subject: 'Verify your AgriConnect Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2e7d32; margin: 0;">AgriConnect / உழவர்வளம்</h2>
                <p style="color: #666; font-style: italic; margin: 5px 0 0 0;">Smart Agricultural Resource Management</p>
              </div>
              <p>Hello,</p>
              <p>Thank you for registering with AgriConnect! Click the button below to verify your email address and activate your account:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
              </div>
              <p style="font-size: 12px; color: #888;">If you did not sign up for this account, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 11px; color: #999; text-align: center;">AgriConnect Inc. Coimbatore, India</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        return res.json({ message: 'Verification email sent successfully via SMTP', requiresConfirmation: true });
      } else {
        console.log(`Registering user via Supabase Admin (Auto-Confirming): ${email}`);
        
        // Create user with confirm = true (bypass email verification!)
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name,
            role,
            district,
            location: district,
            phone
          }
        });

        if (createError) throw createError;

        if (userData && userData.user) {
          await supabasePublic.from('profiles').upsert({
            id: userData.user.id,
            full_name: full_name || email.split('@')[0],
            phone: phone || '',
            location: district || 'Coimbatore',
            role: role || 'Farmer',
            updated_at: new Date().toISOString()
          }).catch(err => console.warn('Profile upsert warning:', err.message));
        }

        return res.json({ message: 'User registered and auto-confirmed successfully', requiresConfirmation: false });
      }
    } else {
      return res.status(400).json({ 
        error: 'SMTP_CONFIG_MISSING', 
        message: 'Supabase Admin Key is not configured on the backend server. Falling back to frontend client.' 
      });
    }
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ error: err.message || 'Failed to complete registration' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    if (supabaseAdmin && hasSmtpConfig) {
      console.log(`Resending verification link via Supabase Admin: ${email}`);

      // Generate verification link
      let verificationLink;
      try {
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email,
          options: {
            redirectTo: 'http://localhost:5173/auth'
          }
        });

        if (error) throw error;
        verificationLink = data.properties.action_link;
      } catch (linkError) {
        if (linkError.message.toLowerCase().includes('confirmed') || linkError.message.toLowerCase().includes('verified') || linkError.message.toLowerCase().includes('already')) {
          return res.status(400).json({ 
            error: 'EMAIL_ALREADY_CONFIRMED', 
            message: 'This email is already verified. Please log in directly.' 
          });
        }
        throw linkError;
      }

      // Configure nodemailer transporter using IPv4 DNS resolution helper
      const transporter = await createMailTransporter();

      // Send mail
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@agriconnect.local',
        to: email,
        subject: 'Verify your AgriConnect Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2e7d32; margin: 0;">AgriConnect / உழவர்வளம்</h2>
              <p style="color: #666; font-style: italic; margin: 5px 0 0 0;">Smart Agricultural Resource Management</p>
            </div>
            <p>Hello,</p>
            <p>As requested, here is your verification link to activate your AgriConnect account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="font-size: 12px; color: #888;">If you did not request this email, you can safely ignore it.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #999; text-align: center;">AgriConnect Inc. Coimbatore, India</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return res.json({ message: 'Verification email resent successfully via SMTP' });
    } else {
      return res.status(400).json({ 
        error: 'SMTP_CONFIG_MISSING', 
        message: 'Custom SMTP or Supabase Admin Key is not configured on the backend server.' 
      });
    }
  } catch (err) {
    console.error('Error in resend-verification:', err);
    res.status(500).json({ error: err.message || 'Failed to resend verification email' });
  }
});

export default router;
