/**
 * Main Entry Point
 * STRATCOM Global Command
 */

import { GlobeRenderer } from './core/GlobeRenderer.js';
import { MapManager } from './core/MapManager.js';
import { InputHandler } from './core/InputHandler.js';
import { HUDController } from './core/HUDController.js';
import { GAME_CONFIG } from './config/firebase.config.js';

class StratcomGame {
    constructor() {
        this.globe = null;
        this.map = null;
        this.input = null;
        this.hud = null;
        
        // Game state
        this.gameDate = { ...GAME_CONFIG.START_DATE };
        this.gameSpeed = 0;
        this.lastTick = 0;
        
        // Stats update interval
        this.statsInterval = null;
    }
    
    /**
     * Initialize the game
     */
    async init() {
        console.log('STRATCOM Global Command initializing...');
        
        // Initialize HUD first for loading updates
        this.hud = new HUDController();
        this.hud.init();
        this.hud.setLoadingProgress(10, 'INITIALIZING SYSTEMS...');
        
        try {
            // Initialize globe renderer
            this.hud.setLoadingProgress(20, 'INITIALIZING 3D RENDERER...');
            const container = document.getElementById('globe-container');
            this.globe = new GlobeRenderer(container);
            
            this.globe.onReady = () => {
                console.log('Globe renderer ready');
            };
            
            await this.globe.init();
            this.hud.setLoadingProgress(50, 'LOADING MAP DATA...');
            
            // Initialize map manager
            this.map = new MapManager();
            
            // Try to load SVG map if available
            const mapLoaded = await this.loadMap();
            
            if (mapLoaded) {
                this.hud.setLoadingProgress(70, 'PROCESSING TERRITORIES...');
                this.map.applyRadarTheme();
                
                // Render to globe
                const canvas = await this.map.renderToCanvas();
                this.globe.updateMapTexture(canvas);
            } else {
                // Use procedural texture if no map available
                this.hud.setLoadingProgress(70, 'GENERATING TERRAIN...');
                this.generateProceduralMap();
            }
            
            // Initialize input handler
            this.hud.setLoadingProgress(80, 'CALIBRATING INPUT SYSTEMS...');
            this.input = new InputHandler(this.globe, this.map);
            this.input.init();
            this.setupInputCallbacks();
            
            // Set up HUD callbacks
            this.hud.setLoadingProgress(90, 'CONNECTING TO COMMAND...');
            this.setupHUDCallbacks();
            
            // Start stats update loop
            this.startStatsLoop();
            
            // Final setup
            this.hud.setLoadingProgress(100, 'SYSTEMS ONLINE');
            this.hud.setConnectionStatus('ready');
            this.hud.updateDate(this.gameDate);
            
            // Hide loading screen after short delay
            setTimeout(() => {
                this.hud.hideLoading();
                console.log('STRATCOM Global Command ready');
            }, 500);
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.hud.setLoadingProgress(100, 'INITIALIZATION FAILED');
            this.hud.setConnectionStatus('error', 'SYSTEM ERROR');
        }
    }
    
    /**
     * Attempt to load SVG map
     * @returns {Promise<boolean>}
     */
    async loadMap() {
        // Try to load from assets folder
        const mapPaths = [
            'assets/maps/world.svg',
            'assets/maps/MapChart_Map.svg',
            'assets/world.svg'
        ];
        
        for (const path of mapPaths) {
            try {
                const loaded = await this.map.loadSVG(path);
                if (loaded) {
                    console.log(`Loaded map from: ${path}`);
                    return true;
                }
            } catch (e) {
                // Try next path
            }
        }
        
        console.log('No SVG map found, will use procedural generation');
        return false;
    }
    
    /**
     * Generate a simple procedural map texture
     */
    generateProceduralMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        
        // Ocean background
        ctx.fillStyle = '#0a0f14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw simplified continents
        ctx.fillStyle = '#1a2520';
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        
        // North America (simplified)
        ctx.beginPath();
        ctx.moveTo(400, 300);
        ctx.lineTo(800, 200);
        ctx.lineTo(1000, 400);
        ctx.lineTo(900, 700);
        ctx.lineTo(600, 800);
        ctx.lineTo(300, 600);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // South America
        ctx.beginPath();
        ctx.moveTo(700, 900);
        ctx.lineTo(900, 850);
        ctx.lineTo(950, 1200);
        ctx.lineTo(850, 1500);
        ctx.lineTo(650, 1400);
        ctx.lineTo(600, 1100);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Europe
        ctx.beginPath();
        ctx.moveTo(1800, 250);
        ctx.lineTo(2200, 200);
        ctx.lineTo(2400, 350);
        ctx.lineTo(2300, 500);
        ctx.lineTo(1900, 550);
        ctx.lineTo(1750, 400);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Africa
        ctx.beginPath();
        ctx.moveTo(1800, 600);
        ctx.lineTo(2200, 550);
        ctx.lineTo(2350, 800);
        ctx.lineTo(2200, 1200);
        ctx.lineTo(1900, 1150);
        ctx.lineTo(1750, 900);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Asia
        ctx.beginPath();
        ctx.moveTo(2400, 200);
        ctx.lineTo(3200, 150);
        ctx.lineTo(3500, 400);
        ctx.lineTo(3400, 700);
        ctx.lineTo(2800, 750);
        ctx.lineTo(2500, 500);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Australia
        ctx.beginPath();
        ctx.moveTo(3200, 1000);
        ctx.lineTo(3550, 950);
        ctx.lineTo(3600, 1200);
        ctx.lineTo(3400, 1350);
        ctx.lineTo(3150, 1250);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Grid lines (radar style)
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.lineWidth = 1;
        
        // Latitude lines
        for (let i = 0; i < canvas.height; i += 128) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Longitude lines
        for (let i = 0; i < canvas.width; i += 128) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        
        this.globe.updateMapTexture(canvas);
    }
    
    /**
     * Set up input callbacks
     */
    setupInputCallbacks() {
        this.input.onCoordsUpdate = (coords) => {
            this.hud.updateCoords(coords);
        };
        
        this.input.onStateHover = (state) => {
            if (state) {
                this.hud.showTerritoryPanel(state);
            } else {
                this.hud.clearTerritoryPanel();
            }
        };
        
        this.input.onStateSelect = (state) => {
            if (state) {
                console.log('Selected:', state.name || state.id);
                // Could show nation panel if we had nation data
            }
        };
        
        this.input.onKeyPress = (key, event) => {
            switch (key) {
                case ' ':
                    event.preventDefault();
                    this.togglePause();
                    break;
                case '+':
                case '=':
                    this.increaseSpeed();
                    break;
                case '-':
                    this.decreaseSpeed();
                    break;
            }
        };
    }
    
    /**
     * Set up HUD callbacks
     */
    setupHUDCallbacks() {
        this.hud.onSpeedChange = (speed) => {
            this.setGameSpeed(speed);
        };
        
        // Auth button
        const btnAuth = document.getElementById('btn-auth');
        if (btnAuth) {
            btnAuth.addEventListener('click', () => {
                // Will implement Firebase Auth later
                console.log('Auth clicked - Firebase Auth to be implemented');
            });
        }
    }
    
    /**
     * Start the stats update loop
     */
    startStatsLoop() {
        this.statsInterval = setInterval(() => {
            // Update FPS
            this.hud.updateFPS(this.globe.getFPS());
            
            // Update zoom
            this.hud.updateZoom(this.globe.getZoomLevel());
        }, 500);
    }
    
    /**
     * Game tick - advances game time
     */
    tick() {
        if (this.gameSpeed === 0) return;
        
        // Advance day
        this.gameDate.day++;
        
        // Handle month overflow
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (this.gameDate.day > daysInMonth[this.gameDate.month - 1]) {
            this.gameDate.day = 1;
            this.gameDate.month++;
            
            if (this.gameDate.month > 12) {
                this.gameDate.month = 1;
                this.gameDate.year++;
            }
        }
        
        this.hud.updateDate(this.gameDate);
    }
    
    /**
     * Set game speed
     * @param {number} speed - 0 = paused, 1 = normal, 2 = fast
     */
    setGameSpeed(speed) {
        this.gameSpeed = speed;
        this.hud.setSpeed(speed);
        
        // Stop auto-rotate when game is running
        this.globe.setAutoRotate(speed === 0);
    }
    
    /**
     * Toggle pause
     */
    togglePause() {
        if (this.gameSpeed === 0) {
            this.setGameSpeed(1);
        } else {
            this.setGameSpeed(0);
        }
    }
    
    /**
     * Increase game speed
     */
    increaseSpeed() {
        const newSpeed = Math.min(this.gameSpeed + 1, 3);
        this.setGameSpeed(newSpeed);
    }
    
    /**
     * Decrease game speed
     */
    decreaseSpeed() {
        const newSpeed = Math.max(this.gameSpeed - 1, 0);
        this.setGameSpeed(newSpeed);
    }
    
    /**
     * Clean up
     */
    dispose() {
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
        }
        
        this.input?.dispose();
        this.globe?.dispose();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const game = new StratcomGame();
    game.init();
    
    // Make accessible for debugging
    window.stratcom = game;
});
