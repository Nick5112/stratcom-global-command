/**
 * Input Handler
 * STRATCOM Global Command
 * 
 * Handles mouse/touch input for territory interaction
 */

import { KEYS } from '../config/constants.js';

export class InputHandler {
    constructor(globeRenderer, mapManager) {
        this.globe = globeRenderer;
        this.map = mapManager;
        
        // State
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoveredState = null;
        this.selectedState = null;
        
        // Throttling
        this.lastHoverCheck = 0;
        this.hoverThrottleMs = 50;
        
        // Callbacks
        this.onStateHover = null;
        this.onStateClick = null;
        this.onStateSelect = null;
        this.onCoordsUpdate = null;
        this.onKeyPress = null;
        
        // Tooltip element
        this.tooltip = document.getElementById('tooltip');
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize input handlers
     */
    init() {
        this.setupMouseHandlers();
        this.setupTouchHandlers();
        this.setupKeyboardHandlers();
        this.isInitialized = true;
    }
    
    /**
     * Set up mouse event handlers
     */
    setupMouseHandlers() {
        const canvas = this.globe.renderer.domElement;
        
        // Mouse move - hover detection
        canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Throttle hover checks
            const now = performance.now();
            if (now - this.lastHoverCheck >= this.hoverThrottleMs) {
                this.lastHoverCheck = now;
                this.checkHover();
            }
            
            // Update coordinates display
            this.updateCoords();
            
            // Update tooltip position
            this.updateTooltipPosition();
        });
        
        // Mouse leave - clear hover
        canvas.addEventListener('mouseleave', () => {
            this.clearHover();
            this.hideTooltip();
        });
        
        // Click - select state
        canvas.addEventListener('click', (e) => {
            // Ignore if user was dragging
            if (this.globe.controls.state !== 0) return; // STATE.NONE = 0
            
            const state = this.getStateAtMouse();
            if (state) {
                this.selectState(state);
            } else {
                this.deselectState();
            }
        });
        
        // Right click - deselect
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.deselectState();
        });
    }
    
    /**
     * Set up touch event handlers
     */
    setupTouchHandlers() {
        const canvas = this.globe.renderer.domElement;
        
        // Touch for mobile
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            // Single tap = select
            if (e.changedTouches.length === 1) {
                const state = this.getStateAtMouse();
                if (state) {
                    this.selectState(state);
                }
            }
        });
    }
    
    /**
     * Set up keyboard handlers
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (this.onKeyPress) {
                this.onKeyPress(e.key, e);
            }
            
            // Handle escape
            if (e.key === KEYS.ESCAPE) {
                this.deselectState();
            }
        });
    }
    
    /**
     * Check for state under mouse and update hover
     */
    checkHover() {
        const state = this.getStateAtMouse();
        
        if (state !== this.hoveredState) {
            // Unhighlight previous
            if (this.hoveredState) {
                this.map.unhighlightState(this.hoveredState.id);
            }
            
            // Highlight new
            if (state) {
                this.map.highlightState(state.id);
                this.showTooltip(state);
            } else {
                this.hideTooltip();
            }
            
            this.hoveredState = state;
            
            // Callback
            if (this.onStateHover) {
                this.onStateHover(state);
            }
            
            // Update globe texture
            this.refreshTexture();
        }
    }
    
    /**
     * Get the state at current mouse position
     * @returns {Object|null}
     */
    getStateAtMouse() {
        const coords = this.globe.screenToLatLon(this.mouseX, this.mouseY);
        if (!coords) return null;
        
        return this.map.findStateAtCoords(coords.lat, coords.lon);
    }
    
    /**
     * Update coordinates display
     */
    updateCoords() {
        const coords = this.globe.screenToLatLon(this.mouseX, this.mouseY);
        
        if (this.onCoordsUpdate) {
            this.onCoordsUpdate(coords);
        }
    }
    
    /**
     * Clear hover state
     */
    clearHover() {
        if (this.hoveredState) {
            this.map.unhighlightState(this.hoveredState.id);
            this.hoveredState = null;
            this.refreshTexture();
        }
    }
    
    /**
     * Select a state
     * @param {Object} state
     */
    selectState(state) {
        // Deselect previous
        if (this.selectedState) {
            this.map.unhighlightState(this.selectedState.id);
        }
        
        this.selectedState = state;
        
        // Visual feedback
        if (state) {
            this.map.highlightState(state.id, '#3a4540');
        }
        
        // Callback
        if (this.onStateSelect) {
            this.onStateSelect(state);
        }
        
        if (this.onStateClick) {
            this.onStateClick(state);
        }
        
        this.refreshTexture();
    }
    
    /**
     * Deselect current state
     */
    deselectState() {
        if (this.selectedState) {
            this.map.unhighlightState(this.selectedState.id);
            this.selectedState = null;
            
            if (this.onStateSelect) {
                this.onStateSelect(null);
            }
            
            this.refreshTexture();
        }
    }
    
    /**
     * Show tooltip for a state
     * @param {Object} state
     */
    showTooltip(state) {
        if (!this.tooltip) return;
        
        // Update content
        const nameEl = document.getElementById('tooltip-name');
        const ownerEl = document.getElementById('tooltip-owner');
        const popEl = document.getElementById('tooltip-pop');
        
        if (nameEl) nameEl.textContent = state.name || state.id;
        if (ownerEl) ownerEl.textContent = state.owner || 'Unclaimed';
        if (popEl) popEl.textContent = state.data?.population?.toLocaleString() || '--';
        
        this.tooltip.classList.remove('hidden');
        this.updateTooltipPosition();
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.add('hidden');
        }
    }
    
    /**
     * Update tooltip position
     */
    updateTooltipPosition() {
        if (!this.tooltip || this.tooltip.classList.contains('hidden')) return;
        
        const offset = 15;
        let x = this.mouseX + offset;
        let y = this.mouseY + offset;
        
        // Keep tooltip on screen
        const rect = this.tooltip.getBoundingClientRect();
        if (x + rect.width > window.innerWidth) {
            x = this.mouseX - rect.width - offset;
        }
        if (y + rect.height > window.innerHeight) {
            y = this.mouseY - rect.height - offset;
        }
        
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    }
    
    /**
     * Refresh the globe texture after map changes
     */
    async refreshTexture() {
        if (!this.map.isLoaded) return;
        
        try {
            const canvas = await this.map.renderToCanvas();
            this.globe.updateMapTexture(canvas);
        } catch (error) {
            console.error('Failed to refresh texture:', error);
        }
    }
    
    /**
     * Dispose event listeners
     */
    dispose() {
        // Event listeners are cleaned up when canvas is removed
        this.isInitialized = false;
    }
}
