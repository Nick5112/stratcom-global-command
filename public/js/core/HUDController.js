/**
 * HUD Controller
 * STRATCOM Global Command
 * 
 * Controls all HUD elements and UI updates
 */

import { GAME_CONFIG } from '../config/firebase.config.js';

export class HUDController {
    constructor() {
        // Element references
        this.elements = {
            // Top HUD
            gameDate: document.getElementById('game-date'),
            connectionStatus: document.getElementById('connection-status'),
            statusDot: document.querySelector('.status-dot'),
            statusText: document.querySelector('.status-text'),
            playerName: document.getElementById('player-name'),
            btnAuth: document.getElementById('btn-auth'),
            
            // Bottom HUD
            latValue: document.getElementById('lat-value'),
            lonValue: document.getElementById('lon-value'),
            zoomLevel: document.getElementById('zoom-level'),
            fpsValue: document.getElementById('fps-value'),
            gameSpeed: document.getElementById('game-speed'),
            
            // Controls
            btnPause: document.getElementById('btn-pause'),
            btnPlay: document.getElementById('btn-play'),
            btnFast: document.getElementById('btn-fast'),
            
            // Panels
            nationPanel: document.getElementById('nation-panel'),
            territoryPanel: document.getElementById('territory-panel'),
            
            // Loading
            loadingScreen: document.getElementById('loading-screen'),
            loadingProgress: document.getElementById('loading-progress'),
            loadingText: document.getElementById('loading-text')
        };
        
        // State
        this.currentSpeed = 0;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the HUD
     */
    init() {
        this.setupControlButtons();
        this.isInitialized = true;
    }
    
    /**
     * Set up control button event listeners
     */
    setupControlButtons() {
        const { btnPause, btnPlay, btnFast } = this.elements;
        
        if (btnPause) {
            btnPause.addEventListener('click', () => {
                this.setSpeed(0);
                this.onSpeedChange?.(0);
            });
        }
        
        if (btnPlay) {
            btnPlay.addEventListener('click', () => {
                this.setSpeed(1);
                this.onSpeedChange?.(1);
            });
        }
        
        if (btnFast) {
            btnFast.addEventListener('click', () => {
                this.setSpeed(2);
                this.onSpeedChange?.(2);
            });
        }
    }
    
    /**
     * Update loading progress
     * @param {number} percent - 0 to 100
     * @param {string} text - Loading message
     */
    setLoadingProgress(percent, text = null) {
        const { loadingProgress, loadingText } = this.elements;
        
        if (loadingProgress) {
            loadingProgress.style.width = `${percent}%`;
        }
        
        if (loadingText && text) {
            loadingText.textContent = text;
        }
    }
    
    /**
     * Hide loading screen
     */
    hideLoading() {
        const { loadingScreen } = this.elements;
        
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    /**
     * Update connection status
     * @param {string} status - 'connecting', 'connected', 'error'
     * @param {string} message
     */
    setConnectionStatus(status, message = null) {
        const { statusDot, statusText } = this.elements;
        
        if (statusDot) {
            statusDot.classList.remove('connected', 'error');
            if (status === 'connected') {
                statusDot.classList.add('connected');
            } else if (status === 'error') {
                statusDot.classList.add('error');
            }
        }
        
        if (statusText) {
            const messages = {
                connecting: 'CONNECTING...',
                connected: 'ONLINE',
                error: 'OFFLINE',
                ready: 'SYSTEMS READY'
            };
            statusText.textContent = message || messages[status] || status.toUpperCase();
        }
    }
    
    /**
     * Update coordinates display
     * @param {Object|null} coords - { lat, lon } or null
     */
    updateCoords(coords) {
        const { latValue, lonValue } = this.elements;
        
        if (coords) {
            if (latValue) latValue.textContent = coords.lat.toFixed(2);
            if (lonValue) lonValue.textContent = coords.lon.toFixed(2);
        } else {
            if (latValue) latValue.textContent = '---.--';
            if (lonValue) lonValue.textContent = '---.--';
        }
    }
    
    /**
     * Update zoom level display
     * @param {number|string} level
     */
    updateZoom(level) {
        const { zoomLevel } = this.elements;
        if (zoomLevel) {
            zoomLevel.textContent = `${level}x`;
        }
    }
    
    /**
     * Update FPS display
     * @param {number} fps
     */
    updateFPS(fps) {
        const { fpsValue } = this.elements;
        if (fpsValue) {
            fpsValue.textContent = fps;
        }
    }
    
    /**
     * Update game date display
     * @param {Object} date - { year, month, day }
     */
    updateDate(date) {
        const { gameDate } = this.elements;
        if (gameDate) {
            const monthStr = String(date.month).padStart(2, '0');
            const dayStr = String(date.day).padStart(2, '0');
            gameDate.textContent = `${date.year}.${monthStr}.${dayStr}`;
        }
    }
    
    /**
     * Set game speed
     * @param {number} speed - 0 = paused, 1 = normal, 2 = fast
     */
    setSpeed(speed) {
        this.currentSpeed = speed;
        
        const { btnPause, btnPlay, btnFast, gameSpeed } = this.elements;
        
        // Update button states
        btnPause?.classList.toggle('active', speed === 0);
        btnPlay?.classList.toggle('active', speed === 1);
        btnFast?.classList.toggle('active', speed === 2);
        
        // Update speed text
        if (gameSpeed) {
            const speedTexts = ['PAUSED', 'NORMAL', 'FAST', 'V.FAST'];
            gameSpeed.textContent = speedTexts[speed] || 'UNKNOWN';
        }
    }
    
    /**
     * Update player info
     * @param {Object|null} player - { name, nation } or null
     */
    updatePlayer(player) {
        const { playerName, btnAuth } = this.elements;
        
        if (player) {
            if (playerName) playerName.textContent = player.name;
            if (btnAuth) btnAuth.textContent = 'LOGOUT';
        } else {
            if (playerName) playerName.textContent = 'UNASSIGNED';
            if (btnAuth) btnAuth.textContent = 'LOGIN';
        }
    }
    
    /**
     * Show nation panel with nation data
     * @param {Object} nation
     */
    showNationPanel(nation) {
        const { nationPanel } = this.elements;
        if (!nationPanel) return;
        
        nationPanel.innerHTML = `
            <div class="nation-card">
                <div class="nation-header">
                    <span class="nation-flag">${nation.flag || '🏴'}</span>
                    <div class="nation-info">
                        <div class="nation-name">${nation.name}</div>
                        <div class="nation-type">${nation.type || 'NATION'}</div>
                    </div>
                </div>
            </div>
            
            <div class="panel-section">
                <div class="panel-section-header">STATISTICS</div>
                <div class="panel-row">
                    <span class="panel-label">Population</span>
                    <span class="panel-value">${(nation.population || 0).toLocaleString()}</span>
                </div>
                <div class="panel-row">
                    <span class="panel-label">GDP</span>
                    <span class="panel-value">$${(nation.gdp || 0).toLocaleString()}B</span>
                </div>
                <div class="panel-row">
                    <span class="panel-label">Military</span>
                    <span class="panel-value">${(nation.military || 0).toLocaleString()}</span>
                </div>
                <div class="panel-row">
                    <span class="panel-label">Territories</span>
                    <span class="panel-value">${nation.territories || 0}</span>
                </div>
            </div>
            
            <div class="panel-section">
                <div class="panel-section-header">STABILITY</div>
                <div class="resource-bar">
                    <div class="resource-header">
                        <span class="resource-name">Political Stability</span>
                        <span class="resource-value">${nation.stability || 50}%</span>
                    </div>
                    <div class="resource-track">
                        <div class="resource-fill ${nation.stability < 30 ? 'danger' : nation.stability < 60 ? 'warning' : ''}" 
                             style="width: ${nation.stability || 50}%"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Clear nation panel
     */
    clearNationPanel() {
        const { nationPanel } = this.elements;
        if (nationPanel) {
            nationPanel.innerHTML = `
                <div class="panel-placeholder">
                    <span class="placeholder-icon">⊕</span>
                    <span class="placeholder-text">SELECT A NATION</span>
                </div>
            `;
        }
    }
    
    /**
     * Show territory panel with territory data
     * @param {Object} territory
     */
    showTerritoryPanel(territory) {
        const { territoryPanel } = this.elements;
        if (!territoryPanel) return;
        
        territoryPanel.innerHTML = `
            <div class="panel-section">
                <div class="panel-section-header">TERRITORY INFO</div>
                <div class="panel-row">
                    <span class="panel-label">Name</span>
                    <span class="panel-value">${territory.name || territory.id}</span>
                </div>
                <div class="panel-row">
                    <span class="panel-label">Owner</span>
                    <span class="panel-value">${territory.owner || 'Unclaimed'}</span>
                </div>
                <div class="panel-row">
                    <span class="panel-label">Population</span>
                    <span class="panel-value">${(territory.data?.population || 0).toLocaleString()}</span>
                </div>
            </div>
            
            ${territory.data?.resources ? `
            <div class="panel-section">
                <div class="panel-section-header">RESOURCES</div>
                ${Object.entries(territory.data.resources).map(([key, val]) => `
                    <div class="panel-row">
                        <span class="panel-label">${key}</span>
                        <span class="panel-value">${val}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${territory.data?.buildings ? `
            <div class="panel-section">
                <div class="panel-section-header">BUILDINGS</div>
                ${Object.entries(territory.data.buildings).map(([key, val]) => `
                    <div class="panel-row">
                        <span class="panel-label">${key}</span>
                        <span class="panel-value">${val}</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
    }
    
    /**
     * Clear territory panel
     */
    clearTerritoryPanel() {
        const { territoryPanel } = this.elements;
        if (territoryPanel) {
            territoryPanel.innerHTML = `
                <div class="panel-placeholder">
                    <span class="placeholder-icon">◎</span>
                    <span class="placeholder-text">HOVER OVER TERRITORY</span>
                </div>
            `;
        }
    }
    
    // Callbacks (set by main app)
    onSpeedChange = null;
    onAuthClick = null;
}
