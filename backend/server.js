import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

// Import routes
import resourceRoutes from './routes/resources.js';
import chatRoutes from './routes/chats.js';
import profileRoutes from './routes/profiles.js';
import authRoutes from './routes/auth.js';
import predictionRoutes from './routes/prediction.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/resources', resourceRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/prediction', predictionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log('\n==================================================');
  console.log('🌱 AgriConnect Backend Server initialized');
  console.log('==================================================');
  console.log('🤖 Model has been started: AgriConnect Biomass Surplus Predictor (v2.1)');
  console.log('🤖 Model has been started: Smart Biomass Proximity Matchmaker (v1.0)');
  console.log('🤖 Model has been started: Market Price & Transport Cost Engine (v1.4)');
  console.log('🤖 Model has been started: Tamil Nadu Eco Carbon Impact Analytics (v1.0)');
  console.log('==================================================');
  console.log(`🚀 Server listening at: http://localhost:${PORT}`);
  console.log('==================================================\n');
});
