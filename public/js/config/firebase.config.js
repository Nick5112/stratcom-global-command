/**
 * Firebase Configuration
 * STRATCOM Global Command
 * 
 * Replace these values with your actual Firebase project config
 */

export const firebaseConfig = {
    apiKey: "AIzaSyCwm6URBOZqa7RG2WyqjYpcB-fTt2TOu14",
    authDomain: "stratcom-global-cmd.firebaseapp.com",
    projectId: "stratcom-global-cmd",
    storageBucket: "stratcom-global-cmd.firebasestorage.app",
    messagingSenderId: "546213515536",
    appId: "1:546213515536:web:7178a4229352c2d68ed595"
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
