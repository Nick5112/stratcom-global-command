/**
 * Menu Controller
 * STRATCOM Global Command
 * 
 * Handles main menu UI, authentication flow, and game start/load
 */

import { firebaseService } from '../services/FirebaseService.js';

export class MenuController {
    constructor() {
        this.elements = {};
        this.currentModal = null;
        this.consoleLines = [];
        this.maxConsoleLines = 50;
        
        // Callbacks
        this.onStartGame = null;
        this.onLoadGame = null;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the menu controller
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupFirebaseCallbacks();
        this.initFirebase();
        
        this.isInitialized = true;
        this.log('Menu system initialized', 'success');
    }
    
    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            // Screens
            menuScreen: document.getElementById('menu-screen'),
            gameScreen: document.getElementById('game-screen'),
            loadingScreen: document.getElementById('loading-screen'),
            
            // Auth elements
            authLoggedOut: document.getElementById('auth-logged-out'),
            authLoggedIn: document.getElementById('auth-logged-in'),
            authStatusBadge: document.getElementById('auth-status-badge'),
            userAvatar: document.getElementById('user-avatar'),
            userDisplayName: document.getElementById('user-display-name'),
            userEmail: document.getElementById('user-email'),
            
            // Login form
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            
            // Buttons
            btnNewGame: document.getElementById('btn-new-game'),
            btnLoadGame: document.getElementById('btn-load-game'),
            btnMultiplayer: document.getElementById('btn-multiplayer'),
            btnSettings: document.getElementById('btn-settings'),
            btnLogin: document.getElementById('btn-login'),
            btnGoogleLogin: document.getElementById('btn-google-login'),
            btnRegister: document.getElementById('btn-register'),
            btnForgot: document.getElementById('btn-forgot'),
            btnLogout: document.getElementById('btn-logout'),
            btnStartCampaign: document.getElementById('btn-start-campaign'),
            
            // Modals
            modalNewGame: document.getElementById('modal-new-game'),
            modalMultiplayer: document.getElementById('modal-multiplayer'),
            
            // New game form
            newGameName: document.getElementById('new-game-name'),
            newGameNation: document.getElementById('new-game-nation'),
            newGameDifficulty: document.getElementById('new-game-difficulty'),
            
            // Saves
            savesList: document.getElementById('saves-list'),
            
            // Console
            consoleOutput: document.getElementById('menu-console-output'),
            
            // Footer
            serverStatus: document.getElementById('server-status'),
            pingValue: document.getElementById('ping-value'),
            playersOnline: document.getElementById('players-online')
        };
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const { 
            btnNewGame, btnLoadGame, btnMultiplayer, btnSettings,
            btnLogin, btnGoogleLogin, btnRegister, btnForgot, btnLogout,
            btnStartCampaign, loginEmail, loginPassword
        } = this.elements;
        
        // Main menu buttons
        btnNewGame?.addEventListener('click', () => this.openModal('modal-new-game'));
        btnLoadGame?.addEventListener('click', () => this.handleLoadGameClick());
        btnMultiplayer?.addEventListener('click', () => this.openModal('modal-multiplayer'));
        btnSettings?.addEventListener('click', () => this.log('Settings not yet implemented', 'warning'));
        
        // Auth buttons
        btnLogin?.addEventListener('click', () => this.handleEmailLogin());
        btnGoogleLogin?.addEventListener('click', () => this.handleGoogleLogin());
        btnRegister?.addEventListener('click', () => this.handleRegister());
        btnForgot?.addEventListener('click', () => this.handleForgotPassword());
        btnLogout?.addEventListener('click', () => this.handleLogout());
        
        // Enter key on login form
        loginPassword?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleEmailLogin();
        });
        loginEmail?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loginPassword?.focus();
        });
        
        // New game
        btnStartCampaign?.addEventListener('click', () => this.handleStartCampaign());
        
        // Modal close buttons
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal();
            });
        });
        
        // Escape key closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }
    
    /**
     * Set up Firebase auth callbacks
     */
    setupFirebaseCallbacks() {
        firebaseService.onAuthStateChanged = (user) => {
            this.handleAuthStateChange(user);
        };
        
        firebaseService.onError = (error) => {
            this.log(`Firebase error: ${error.message}`, 'error');
        };
    }
    
    /**
     * Initialize Firebase
     */
    initFirebase() {
        this.log('Connecting to Firebase...', 'info');
        
        const success = firebaseService.init();
        
        if (success) {
            this.log('Firebase connection established', 'success');
            this.updateServerStatus('ONLINE', true);
            this.simulatePing();
        } else {
            this.log('Firebase connection failed', 'error');
            this.updateServerStatus('OFFLINE', false);
        }
    }
    
    /**
     * Handle auth state changes
     * @param {Object} user - Firebase user or null
     */
    handleAuthStateChange(user) {
        const { 
            authLoggedOut, authLoggedIn, authStatusBadge,
            userAvatar, userDisplayName, userEmail,
            btnLoadGame, btnMultiplayer
        } = this.elements;
        
        if (user) {
            // User is signed in
            authLoggedOut?.classList.add('hidden');
            authLoggedIn?.classList.remove('hidden');
            
            if (authStatusBadge) {
                authStatusBadge.textContent = 'ONLINE';
                authStatusBadge.classList.remove('offline');
                authStatusBadge.classList.add('online');
            }
            
            // Update user info
            const displayName = user.displayName || user.email.split('@')[0];
            if (userDisplayName) userDisplayName.textContent = displayName.toUpperCase();
            if (userEmail) userEmail.textContent = user.email;
            if (userAvatar) {
                userAvatar.textContent = user.photoURL ? '' : displayName.charAt(0).toUpperCase();
                if (user.photoURL) {
                    userAvatar.style.backgroundImage = `url(${user.photoURL})`;
                    userAvatar.style.backgroundSize = 'cover';
                }
            }
            
            // Enable authenticated features
            if (btnLoadGame) btnLoadGame.disabled = false;
            if (btnMultiplayer) btnMultiplayer.disabled = false;
            
            this.log(`Operator authenticated: ${displayName}`, 'success');
            this.loadSavedGames();
            
        } else {
            // User is signed out
            authLoggedOut?.classList.remove('hidden');
            authLoggedIn?.classList.add('hidden');
            
            if (authStatusBadge) {
                authStatusBadge.textContent = 'OFFLINE';
                authStatusBadge.classList.remove('online');
                authStatusBadge.classList.add('offline');
            }
            
            // Disable authenticated features
            if (btnLoadGame) btnLoadGame.disabled = true;
            if (btnMultiplayer) btnMultiplayer.disabled = true;
            
            // Clear saves list
            this.showNoSaves();
            
            this.log('Operator signed out', 'info');
        }
    }
    
    /**
     * Handle email login
     */
    async handleEmailLogin() {
        const { loginEmail, loginPassword } = this.elements;
        
        const email = loginEmail?.value?.trim();
        const password = loginPassword?.value;
        
        if (!email || !password) {
            this.log('Email and password required', 'warning');
            return;
        }
        
        this.log('Authenticating...', 'info');
        
        const result = await firebaseService.signInWithEmail(email, password);
        
        if (!result.success) {
            this.log(`Authentication failed: ${result.error}`, 'error');
        }
        
        // Clear password field
        if (loginPassword) loginPassword.value = '';
    }
    
    /**
     * Handle Google login
     */
    async handleGoogleLogin() {
        this.log('Initiating Google authentication...', 'info');
        
        const result = await firebaseService.signInWithGoogle();
        
        if (!result.success) {
            this.log(`Google auth failed: ${result.error}`, 'error');
        }
    }
    
    /**
     * Handle registration
     */
    async handleRegister() {
        const { loginEmail, loginPassword } = this.elements;
        
        const email = loginEmail?.value?.trim();
        const password = loginPassword?.value;
        
        if (!email || !password) {
            this.log('Email and password required for registration', 'warning');
            return;
        }
        
        if (password.length < 6) {
            this.log('Password must be at least 6 characters', 'warning');
            return;
        }
        
        this.log('Creating new operator account...', 'info');
        
        const result = await firebaseService.signUpWithEmail(email, password);
        
        if (result.success) {
            this.log('Account created successfully', 'success');
        } else {
            this.log(`Registration failed: ${result.error}`, 'error');
        }
        
        if (loginPassword) loginPassword.value = '';
    }
    
    /**
     * Handle forgot password
     */
    async handleForgotPassword() {
        const { loginEmail } = this.elements;
        const email = loginEmail?.value?.trim();
        
        if (!email) {
            this.log('Enter email address to reset password', 'warning');
            return;
        }
        
        this.log('Sending password reset...', 'info');
        
        const result = await firebaseService.sendPasswordReset(email);
        
        if (result.success) {
            this.log('Password reset email sent', 'success');
        } else {
            this.log(`Reset failed: ${result.error}`, 'error');
        }
    }
    
    /**
     * Handle logout
     */
    async handleLogout() {
        this.log('Terminating session...', 'info');
        await firebaseService.signOut();
    }
    
    /**
     * Load and display saved games
     */
    async loadSavedGames() {
        const result = await firebaseService.loadSavedGames();
        
        if (result.success && result.saves.length > 0) {
            this.displaySaves(result.saves);
        } else {
            this.showNoSaves();
        }
    }
    
    /**
     * Display saved games in list
     * @param {Array} saves 
     */
    displaySaves(saves) {
        const { savesList } = this.elements;
        if (!savesList) return;
        
        savesList.innerHTML = saves.map(save => {
            const date = save.savedAt?.toDate?.() || new Date();
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="save-item" data-save-id="${save.id}">
                    <div class="save-icon">🎖️</div>
                    <div class="save-info">
                        <div class="save-name">${save.name || 'Unnamed Operation'}</div>
                        <div class="save-meta">${save.nation || 'Unknown'} • ${save.difficulty || 'Normal'}</div>
                    </div>
                    <div class="save-date">
                        <div>${dateStr}</div>
                        <div>${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        savesList.querySelectorAll('.save-item').forEach(item => {
            item.addEventListener('click', () => {
                const saveId = item.dataset.saveId;
                this.handleLoadSave(saveId);
            });
        });
    }
    
    /**
     * Show no saves message
     */
    showNoSaves() {
        const { savesList } = this.elements;
        if (!savesList) return;
        
        const isLoggedIn = firebaseService.isLoggedIn();
        
        savesList.innerHTML = `
            <div class="no-saves">
                <div class="no-saves-icon">📂</div>
                <div class="no-saves-text">NO SAVED OPERATIONS</div>
                <div class="no-saves-text" style="margin-top: 8px; opacity: 0.5;">
                    ${isLoggedIn ? 'Start a new campaign to create saves' : 'Authenticate to access saved data'}
                </div>
            </div>
        `;
    }
    
    /**
     * Handle load game button click
     */
    handleLoadGameClick() {
        if (!firebaseService.isLoggedIn()) {
            this.log('Authentication required to load games', 'warning');
            return;
        }
        
        // Scroll to saves list or highlight it
        const savesList = this.elements.savesList;
        if (savesList) {
            savesList.scrollIntoView({ behavior: 'smooth' });
            savesList.classList.add('alert-flash');
            setTimeout(() => savesList.classList.remove('alert-flash'), 500);
        }
    }
    
    /**
     * Handle loading a specific save
     * @param {string} saveId 
     */
    async handleLoadSave(saveId) {
        this.log(`Loading operation ${saveId.substring(0, 8)}...`, 'info');
        
        const result = await firebaseService.loadGame(saveId);
        
        if (result.success) {
            this.log('Operation data loaded', 'success');
            
            if (this.onLoadGame) {
                this.onLoadGame(result.gameData);
            }
        } else {
            this.log(`Load failed: ${result.error}`, 'error');
        }
    }
    
    /**
     * Handle starting a new campaign
     */
    handleStartCampaign() {
        const { newGameName, newGameNation, newGameDifficulty } = this.elements;
        
        const name = newGameName?.value?.trim() || `OPERATION ${this.generateCodename()}`;
        const nation = newGameNation?.value;
        const difficulty = newGameDifficulty?.value || 'normal';
        
        if (!nation) {
            this.log('Select a nation to begin', 'warning');
            return;
        }
        
        this.log(`Initializing ${name}...`, 'info');
        this.closeModal();
        
        // Create game config
        const gameConfig = {
            name,
            nation,
            difficulty,
            startDate: { year: 2025, month: 1, day: 1 },
            createdAt: new Date().toISOString()
        };
        
        // Start the game
        if (this.onStartGame) {
            this.onStartGame(gameConfig);
        }
    }
    
    /**
     * Generate random military codename
     */
    generateCodename() {
        const adjectives = ['THUNDER', 'IRON', 'STEEL', 'SHADOW', 'RAPID', 'SILENT', 'NOBLE', 'DESERT', 'ARCTIC', 'CRIMSON'];
        const nouns = ['STORM', 'SHIELD', 'SPEAR', 'EAGLE', 'LION', 'WOLF', 'HAMMER', 'SWORD', 'FURY', 'DAWN'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adj} ${noun}`;
    }
    
    /**
     * Open a modal
     * @param {string} modalId 
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.currentModal = modal;
        }
    }
    
    /**
     * Close current modal
     */
    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            this.currentModal = null;
        }
    }
    
    /**
     * Show the menu screen
     */
    showMenu() {
        this.elements.menuScreen?.classList.remove('hidden');
        this.elements.gameScreen?.classList.add('hidden');
    }
    
    /**
     * Hide menu and show game
     */
    hideMenu() {
        this.elements.menuScreen?.classList.add('hidden');
        this.elements.gameScreen?.classList.remove('hidden');
    }
    
    /**
     * Update server status display
     * @param {string} status 
     * @param {boolean} isOnline 
     */
    updateServerStatus(status, isOnline) {
        const { serverStatus } = this.elements;
        if (serverStatus) {
            serverStatus.textContent = status;
            serverStatus.classList.toggle('online', isOnline);
        }
    }
    
    /**
     * Simulate ping display
     */
    simulatePing() {
        const updatePing = () => {
            const ping = Math.floor(20 + Math.random() * 30);
            if (this.elements.pingValue) {
                this.elements.pingValue.textContent = `${ping}ms`;
            }
        };
        
        updatePing();
        setInterval(updatePing, 5000);
    }
    
    /**
     * Log message to menu console
     * @param {string} message 
     * @param {string} type - 'info', 'success', 'warning', 'error'
     */
    log(message, type = 'info') {
        const { consoleOutput } = this.elements;
        if (!consoleOutput) return;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const prefix = {
            info: 'SYS',
            success: 'OK ',
            warning: 'WRN',
            error: 'ERR'
        }[type] || 'SYS';
        
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.innerHTML = `<span class="timestamp">[${prefix}]</span> ${message}`;
        
        consoleOutput.appendChild(line);
        
        // Limit console lines
        this.consoleLines.push(line);
        if (this.consoleLines.length > this.maxConsoleLines) {
            const oldLine = this.consoleLines.shift();
            oldLine.remove();
        }
        
        // Scroll to bottom
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        
        // Also log to browser console
        console.log(`[STRATCOM ${prefix}] ${message}`);
    }
}
