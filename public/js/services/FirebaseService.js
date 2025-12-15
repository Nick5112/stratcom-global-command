/**
 * Firebase Service
 * STRATCOM Global Command
 * 
 * Handles Firebase initialization, authentication, and Firestore operations
 */

import { firebaseConfig } from '../config/firebase.config.js';

class FirebaseService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.isInitialized = false;
        
        // Callbacks
        this.onAuthStateChanged = null;
        this.onError = null;
    }
    
    /**
     * Initialize Firebase
     */
    init() {
        try {
            // Initialize Firebase with compat SDK (loaded via script tag)
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
            } else {
                this.app = firebase.app();
            }
            
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // Listen for auth state changes
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (this.onAuthStateChanged) {
                    this.onAuthStateChanged(user);
                }
            });
            
            this.isInitialized = true;
            console.log('[Firebase] Initialized successfully');
            return true;
            
        } catch (error) {
            console.error('[Firebase] Initialization failed:', error);
            if (this.onError) this.onError(error);
            return false;
        }
    }
    
    // ==========================================
    // AUTHENTICATION METHODS
    // ==========================================
    
    /**
     * Sign in with email and password
     * @param {string} email 
     * @param {string} password 
     */
    async signInWithEmail(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('[Firebase] Signed in:', result.user.email);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('[Firebase] Sign in error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Sign up with email and password
     * @param {string} email 
     * @param {string} password 
     */
    async signUpWithEmail(email, password) {
        try {
            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            console.log('[Firebase] Account created:', result.user.email);
            
            // Create user profile in Firestore
            await this.createUserProfile(result.user);
            
            return { success: true, user: result.user };
        } catch (error) {
            console.error('[Firebase] Sign up error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            console.log('[Firebase] Google sign in:', result.user.email);
            
            // Create/update user profile in Firestore
            await this.createUserProfile(result.user);
            
            return { success: true, user: result.user };
        } catch (error) {
            console.error('[Firebase] Google sign in error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Sign out
     */
    async signOut() {
        try {
            await this.auth.signOut();
            console.log('[Firebase] Signed out');
            return { success: true };
        } catch (error) {
            console.error('[Firebase] Sign out error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Send password reset email
     * @param {string} email 
     */
    async sendPasswordReset(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('[Firebase] Password reset error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Create user profile in Firestore
     * @param {Object} user - Firebase user object
     */
    async createUserProfile(user) {
        const userRef = this.db.collection('players').doc(user.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            await userRef.set({
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                gamesPlayed: 0,
                stats: {
                    wins: 0,
                    losses: 0
                }
            });
        } else {
            // Update last login
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
    
    // ==========================================
    // GAME SAVE/LOAD METHODS
    // ==========================================
    
    /**
     * Save game to Firestore
     * @param {Object} gameData - Game state to save
     */
    async saveGame(gameData) {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in to save' };
        }
        
        try {
            const saveRef = this.db.collection('players')
                .doc(this.currentUser.uid)
                .collection('saves');
            
            const saveData = {
                ...gameData,
                savedAt: firebase.firestore.FieldValue.serverTimestamp(),
                playerId: this.currentUser.uid
            };
            
            let docRef;
            if (gameData.id) {
                // Update existing save
                docRef = saveRef.doc(gameData.id);
                await docRef.update(saveData);
            } else {
                // Create new save
                docRef = await saveRef.add(saveData);
            }
            
            console.log('[Firebase] Game saved:', docRef.id);
            return { success: true, saveId: docRef.id };
            
        } catch (error) {
            console.error('[Firebase] Save error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Load saved games for current user
     */
    async loadSavedGames() {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in', saves: [] };
        }
        
        try {
            const savesRef = this.db.collection('players')
                .doc(this.currentUser.uid)
                .collection('saves')
                .orderBy('savedAt', 'desc')
                .limit(10);
            
            const snapshot = await savesRef.get();
            const saves = [];
            
            snapshot.forEach(doc => {
                saves.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('[Firebase] Loaded', saves.length, 'saves');
            return { success: true, saves };
            
        } catch (error) {
            console.error('[Firebase] Load saves error:', error);
            return { success: false, error: this.getErrorMessage(error), saves: [] };
        }
    }
    
    /**
     * Load a specific game save
     * @param {string} saveId 
     */
    async loadGame(saveId) {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in' };
        }
        
        try {
            const saveRef = this.db.collection('players')
                .doc(this.currentUser.uid)
                .collection('saves')
                .doc(saveId);
            
            const doc = await saveRef.get();
            
            if (!doc.exists) {
                return { success: false, error: 'Save not found' };
            }
            
            return { success: true, gameData: { id: doc.id, ...doc.data() } };
            
        } catch (error) {
            console.error('[Firebase] Load game error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Delete a saved game
     * @param {string} saveId 
     */
    async deleteGame(saveId) {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in' };
        }
        
        try {
            await this.db.collection('players')
                .doc(this.currentUser.uid)
                .collection('saves')
                .doc(saveId)
                .delete();
            
            console.log('[Firebase] Deleted save:', saveId);
            return { success: true };
            
        } catch (error) {
            console.error('[Firebase] Delete save error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    // ==========================================
    // MULTIPLAYER LOBBY METHODS
    // ==========================================
    
    /**
     * Create a multiplayer lobby
     * @param {Object} lobbyData 
     */
    async createLobby(lobbyData) {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in' };
        }
        
        try {
            // Generate 6-character lobby code
            const lobbyCode = this.generateLobbyCode();
            
            const lobbyRef = this.db.collection('lobbies').doc(lobbyCode);
            
            await lobbyRef.set({
                code: lobbyCode,
                hostId: this.currentUser.uid,
                hostName: this.currentUser.displayName || this.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'waiting', // waiting, starting, in_progress
                maxPlayers: lobbyData.maxPlayers || 8,
                settings: lobbyData.settings || {},
                players: {
                    [this.currentUser.uid]: {
                        name: this.currentUser.displayName || this.currentUser.email,
                        nation: null,
                        ready: false,
                        isHost: true,
                        joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }
                }
            });
            
            console.log('[Firebase] Lobby created:', lobbyCode);
            return { success: true, lobbyCode };
            
        } catch (error) {
            console.error('[Firebase] Create lobby error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Join a multiplayer lobby
     * @param {string} lobbyCode 
     */
    async joinLobby(lobbyCode) {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in' };
        }
        
        try {
            const lobbyRef = this.db.collection('lobbies').doc(lobbyCode.toUpperCase());
            const doc = await lobbyRef.get();
            
            if (!doc.exists) {
                return { success: false, error: 'Lobby not found' };
            }
            
            const lobbyData = doc.data();
            
            if (lobbyData.status !== 'waiting') {
                return { success: false, error: 'Game already in progress' };
            }
            
            const playerCount = Object.keys(lobbyData.players).length;
            if (playerCount >= lobbyData.maxPlayers) {
                return { success: false, error: 'Lobby is full' };
            }
            
            // Add player to lobby
            await lobbyRef.update({
                [`players.${this.currentUser.uid}`]: {
                    name: this.currentUser.displayName || this.currentUser.email,
                    nation: null,
                    ready: false,
                    isHost: false,
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            });
            
            console.log('[Firebase] Joined lobby:', lobbyCode);
            return { success: true, lobbyData: { ...lobbyData, code: lobbyCode } };
            
        } catch (error) {
            console.error('[Firebase] Join lobby error:', error);
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Leave a lobby
     * @param {string} lobbyCode 
     */
    async leaveLobby(lobbyCode) {
        if (!this.currentUser) return { success: false };
        
        try {
            const lobbyRef = this.db.collection('lobbies').doc(lobbyCode);
            
            await lobbyRef.update({
                [`players.${this.currentUser.uid}`]: firebase.firestore.FieldValue.delete()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error) };
        }
    }
    
    /**
     * Subscribe to lobby updates
     * @param {string} lobbyCode 
     * @param {Function} callback 
     */
    subscribeLobby(lobbyCode, callback) {
        const lobbyRef = this.db.collection('lobbies').doc(lobbyCode);
        
        return lobbyRef.onSnapshot(doc => {
            if (doc.exists) {
                callback({ ...doc.data(), code: doc.id });
            } else {
                callback(null);
            }
        });
    }
    
    /**
     * Generate random lobby code
     */
    generateLobbyCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    // ==========================================
    // HELPER METHODS
    // ==========================================
    
    /**
     * Get user-friendly error message
     * @param {Error} error 
     */
    getErrorMessage(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password is too weak',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/popup-closed-by-user': 'Sign in was cancelled',
            'auth/network-request-failed': 'Network error - check connection',
            'permission-denied': 'Access denied - check permissions'
        };
        
        return errorMessages[error.code] || error.message || 'An error occurred';
    }
    
    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    /**
     * Get current user data
     */
    getUser() {
        if (!this.currentUser) return null;
        
        return {
            uid: this.currentUser.uid,
            email: this.currentUser.email,
            displayName: this.currentUser.displayName || this.currentUser.email.split('@')[0],
            photoURL: this.currentUser.photoURL
        };
    }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
