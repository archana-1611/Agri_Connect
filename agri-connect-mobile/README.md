# 📱 AgriConnect Mobile Application

**AgriConnect Mobile** is a production-ready, high-performance React Native (Expo) mobile application developed in TypeScript and connected directly to a live PostgreSQL backend powered by Supabase. Built with an Android-first philosophy, it features stunning glassmorphism aesthetics, dual English/Tamil translation support, real-time synchronization, and automated location tracking.

This mobile app is specifically tailored to assist farmers, traders, and buyers in regional hubs like Tamil Nadu to list agricultural surplus produce, coordinate with nearby FPOs, and negotiate deals via a live bargaining-enabled chat room.

---

## ✨ Features Breakdown

1. **Root Splash & Bilingual Parity**: Instant bilingual translations (`English` <-> `தமிழ்`) across every single screen, form field, modal, and alert box.
2. **Dynamic Dashboard**:
   - **Expected Revenue Aggregator**: Calculated dynamically from your active listings in the PostgreSQL `resources` table.
   - **Coimbatore Live Weather Widget**: Connects to the open `Open-Meteo` API to deliver live weather parameters.
3. **GPS Crop Radar Map**: Renders an interactive SVG radar sweep indicating live active buyers and listing hotspots nearby.
4. **Proximity Calculators**: Automatically computes physical distances and proximity metrics using dynamic coordinate lookups.
5. **Automated GPS Resource Listings**:
   - **Voice Auto-Fill (Tap to Speak)**: Simulated speech analysis automatically populates listing parameters.
   - **AI Yield Predictor**: Grounded analytics predict quantity and listing valuations based on historical inputs.
   - **Supabase Storage Integration**: Integrates file uploading to store produce pictures in your public bucket.
   - **Live Proximity Address Capture**: Captures coordinates to automatically fill the pickup address.
6. **Negotiations Inbox**: Real-time incoming requests and active chat list. Updates dynamically using Supabase PostgreSQL replication.
7. **Real-time Counter-Offer Chat Room**:
   - Synchronized text room listening to PostgreSQL insert events.
   - **Bargaining Offer Form**: Submit counter-proposals (e.g. ₹2200) that push custom bargaining logs directly into the text stream.
   - Presence tracking and indicator signals.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Mobile Core** | React Native 0.85, Expo 56 |
| **Language** | TypeScript |
| **Styling** | Vanilla React Native StyleSheets, Linear Gradients |
| **Backend API** | Supabase JS client v2, WebSockets |
| **Local Storage** | React Native Async Storage |
| **Icons** | Lucide React Native |

---

## 📁 Folder Structure

```
agri-connect-mobile/
├── app/                  # Expo Router file-based pages
│   ├── (tabs)/           # Tab navigation pages
│   │   ├── dashboard.tsx # expected revenue, weather widget
│   │   ├── marketplace.tsx # GPS Crop Radar map, nearby buyers
│   │   ├── add-resource.tsx # GPS capturing, voice-to-text, listing
│   │   └── profile.tsx   # active user listings, delete actions
│   ├── chat/
│   │   └── [id].tsx      # real-time bargaining room
│   ├── auth.tsx          # user signup, roles, sessions
│   ├── messages.tsx      # notifications & negotiation requests
│   └── _layout.tsx       # app navigator & auth guard
├── components/           # reusable visual items
├── context/              # authentication, language & resources
├── lib/
│   └── supabase.ts       # Supabase client instantiation
├── tsconfig.json         # strict type checking configuration
└── package.json          # dependency configurations
```

---

## 🚀 Setup & Launch Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies
Navigate to the mobile directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `agri-connect-mobile` directory with your live Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://hacdigrgsncgmqxrmanc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Verify TypeScript Typechecking
Verify that the codebase compiles with zero errors:
```bash
npx tsc --noEmit
```

### 4. Run the Dev Server
Launch Expo:
```bash
# Start the Expo development server
npm run start

# Press 'a' to run on an Android emulator or connected device
# Press 'i' to run on an iOS simulator
# Press 'w' to run in the web browser
```

---

Developed with ❤️ to empower agricultural circular economies.
