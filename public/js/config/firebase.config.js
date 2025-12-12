/**
 * Firebase Configuration
 * STRATCOM Global Command
 * 
 * Replace these values with your actual Firebase project config
 */

export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firestore collection names
export const COLLECTIONS = {
    NATIONS: 'nations',
    TERRITORIES: 'territories',
    PLAYERS: 'players',
    GAMES: 'games',
    GAME_STATE: 'gameState'
};

// Game configuration constants
export const GAME_CONFIG = {
    // Time settings
    TICK_RATE: 1000, // ms per game tick
    TICKS_PER_DAY: 24,
    
    // Game speeds (multipliers)
    SPEEDS: {
        PAUSED: 0,
        SLOW: 0.5,
        NORMAL: 1,
        FAST: 2,
        VERY_FAST: 5
    },
    
    // Initial game date
    START_DATE: {
        year: 2025,
        month: 1,
        day: 1
    }
};
