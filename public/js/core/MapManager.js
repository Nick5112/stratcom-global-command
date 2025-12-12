/**
 * Map Manager
 * STRATCOM Global Command
 * 
 * Handles SVG map loading, processing, and state coloring
 */

import { COLORS, GLOBE } from '../config/constants.js';

export class MapManager {
    constructor() {
        this.svgDoc = null;
        this.svgString = null;
        this.states = new Map(); // Map of state ID -> state data
        this.stateElements = new Map(); // Map of state ID -> SVG element
        this.spatialIndex = []; // Grid for fast state lookup
        
        // Spatial index settings
        this.gridWidth = 360;
        this.gridHeight = 180;
        this.cellsX = 720; // 0.5 degree resolution
        this.cellsY = 360;
        
        // Canvas for rendering
        this.canvas = null;
        this.context = null;
        
        this.isLoaded = false;
    }
    
    /**
     * Load and parse an SVG map file
     * @param {string} svgPath - Path to the SVG file
     * @returns {Promise<boolean>}
     */
    async loadSVG(svgPath) {
        try {
            const response = await fetch(svgPath);
            if (!response.ok) {
                throw new Error(`Failed to load SVG: ${response.statusText}`);
            }
            
            this.svgString = await response.text();
            
            // Parse SVG
            const parser = new DOMParser();
            this.svgDoc = parser.parseFromString(this.svgString, 'image/svg+xml');
            
            // Check for parse errors
            const parseError = this.svgDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('SVG parse error: ' + parseError.textContent);
            }
            
            // Extract state/province elements
            this.extractStates();
            
            this.isLoaded = true;
            console.log(`Loaded SVG with ${this.states.size} states`);
            
            return true;
        } catch (error) {
            console.error('Error loading SVG:', error);
            return false;
        }
    }
    
    /**
     * Extract state elements from SVG
     */
    extractStates() {
        // Look for path elements with IDs (typical for map SVGs)
        const paths = this.svgDoc.querySelectorAll('path[id]');
        
        paths.forEach(path => {
            const id = path.getAttribute('id');
            const name = path.getAttribute('data-name') || 
                         path.getAttribute('title') || 
                         path.getAttribute('name') ||
                         id;
            
            // Try to get centroid from data attributes or calculate
            let centroid = null;
            const dataLat = path.getAttribute('data-lat');
            const dataLon = path.getAttribute('data-lon');
            
            if (dataLat && dataLon) {
                centroid = {
                    lat: parseFloat(dataLat),
                    lon: parseFloat(dataLon)
                };
            }
            
            this.states.set(id, {
                id,
                name: this.decodeHTMLEntities(name),
                centroid,
                owner: null,
                color: null,
                data: {}
            });
            
            this.stateElements.set(id, path);
        });
        
        // Also check for groups with IDs
        const groups = this.svgDoc.querySelectorAll('g[id]');
        groups.forEach(group => {
            const id = group.getAttribute('id');
            if (!this.states.has(id)) {
                const name = group.getAttribute('data-name') || id;
                this.states.set(id, {
                    id,
                    name: this.decodeHTMLEntities(name),
                    centroid: null,
                    owner: null,
                    color: null,
                    data: {}
                });
                this.stateElements.set(id, group);
            }
        });
    }
    
    /**
     * Decode HTML entities in names
     * @param {string} text
     * @returns {string}
     */
    decodeHTMLEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }
    
    /**
     * Set the color of a state
     * @param {string} stateId
     * @param {string} color - CSS color string
     */
    setStateColor(stateId, color) {
        const element = this.stateElements.get(stateId);
        if (element) {
            element.style.fill = color;
            const state = this.states.get(stateId);
            if (state) {
                state.color = color;
            }
        }
    }
    
    /**
     * Apply colors to all states based on nation ownership
     * @param {Map} nationColors - Map of nation ID -> color
     * @param {Map} stateOwnership - Map of state ID -> nation ID
     */
    applyNationColors(nationColors, stateOwnership) {
        for (const [stateId, nationId] of stateOwnership) {
            const color = nationColors.get(nationId);
            if (color) {
                this.setStateColor(stateId, color);
            }
        }
    }
    
    /**
     * Apply radar theme to the SVG
     */
    applyRadarTheme() {
        // Set default land color
        const landColor = '#1a2520';
        const borderColor = '#00ff88';
        const borderWidth = '0.5';
        
        this.stateElements.forEach((element, id) => {
            element.style.fill = landColor;
            element.style.stroke = borderColor;
            element.style.strokeWidth = borderWidth;
            element.style.strokeOpacity = '0.6';
        });
        
        // Also style any ocean/water elements
        const oceanElements = this.svgDoc.querySelectorAll('[id*="ocean"], [id*="water"], [id*="sea"]');
        oceanElements.forEach(el => {
            el.style.fill = '#0a0f14';
        });
    }
    
    /**
     * Render the SVG to a canvas at specified dimensions
     * @param {number} width
     * @param {number} height
     * @returns {Promise<HTMLCanvasElement>}
     */
    async renderToCanvas(width = GLOBE.TEXTURE_WIDTH, height = GLOBE.TEXTURE_HEIGHT) {
        return new Promise((resolve, reject) => {
            // Create canvas if needed
            if (!this.canvas || this.canvas.width !== width || this.canvas.height !== height) {
                this.canvas = document.createElement('canvas');
                this.canvas.width = width;
                this.canvas.height = height;
                this.context = this.canvas.getContext('2d');
            }
            
            // Fill with ocean color
            this.context.fillStyle = '#0a0f14';
            this.context.fillRect(0, 0, width, height);
            
            // Convert SVG to data URL
            const svgRoot = this.svgDoc.documentElement;
            
            // Set viewBox for proper scaling
            svgRoot.setAttribute('width', width);
            svgRoot.setAttribute('height', height);
            
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(this.svgDoc);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = () => {
                this.context.drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(url);
                resolve(this.canvas);
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to render SVG to canvas'));
            };
            img.src = url;
        });
    }
    
    /**
     * Build spatial index for fast state lookup by coordinates
     * @param {Array} stateData - Array of { id, centroid: { lat, lon } }
     */
    buildSpatialIndex(stateData) {
        // Initialize grid
        this.spatialIndex = new Array(this.cellsX * this.cellsY).fill(null);
        
        // For each state, mark grid cells near its centroid
        stateData.forEach(state => {
            if (state.centroid) {
                const { lat, lon } = state.centroid;
                const gridX = Math.floor((lon + 180) * (this.cellsX / 360));
                const gridY = Math.floor((90 - lat) * (this.cellsY / 180));
                
                // Mark surrounding cells too for better hit detection
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        const x = Math.max(0, Math.min(this.cellsX - 1, gridX + dx));
                        const y = Math.max(0, Math.min(this.cellsY - 1, gridY + dy));
                        const index = y * this.cellsX + x;
                        
                        if (!this.spatialIndex[index]) {
                            this.spatialIndex[index] = [];
                        }
                        this.spatialIndex[index].push(state.id);
                    }
                }
            }
        });
    }
    
    /**
     * Find the closest state to given coordinates
     * @param {number} lat
     * @param {number} lon
     * @returns {Object|null} State data or null
     */
    findStateAtCoords(lat, lon) {
        const gridX = Math.floor((lon + 180) * (this.cellsX / 360));
        const gridY = Math.floor((90 - lat) * (this.cellsY / 180));
        
        // Clamp to valid range
        const x = Math.max(0, Math.min(this.cellsX - 1, gridX));
        const y = Math.max(0, Math.min(this.cellsY - 1, gridY));
        const index = y * this.cellsX + x;
        
        const candidates = this.spatialIndex[index];
        if (!candidates || candidates.length === 0) {
            return null;
        }
        
        // Find closest by centroid distance
        let closest = null;
        let minDist = Infinity;
        
        for (const stateId of candidates) {
            const state = this.states.get(stateId);
            if (state && state.centroid) {
                const dist = this.haversineDistance(lat, lon, state.centroid.lat, state.centroid.lon);
                if (dist < minDist) {
                    minDist = dist;
                    closest = state;
                }
            }
        }
        
        return closest;
    }
    
    /**
     * Calculate Haversine distance between two points
     * @param {number} lat1
     * @param {number} lon1
     * @param {number} lat2
     * @param {number} lon2
     * @returns {number} Distance in km
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    /**
     * Highlight a state
     * @param {string} stateId
     * @param {string} highlightColor
     */
    highlightState(stateId, highlightColor = '#2a3530') {
        const element = this.stateElements.get(stateId);
        if (element) {
            element.setAttribute('data-original-fill', element.style.fill || '');
            element.style.fill = highlightColor;
        }
    }
    
    /**
     * Remove highlight from a state
     * @param {string} stateId
     */
    unhighlightState(stateId) {
        const element = this.stateElements.get(stateId);
        if (element) {
            const originalFill = element.getAttribute('data-original-fill');
            if (originalFill) {
                element.style.fill = originalFill;
            }
        }
    }
    
    /**
     * Get all state IDs
     * @returns {Array<string>}
     */
    getAllStateIds() {
        return Array.from(this.states.keys());
    }
    
    /**
     * Get state by ID
     * @param {string} stateId
     * @returns {Object|null}
     */
    getState(stateId) {
        return this.states.get(stateId) || null;
    }
    
    /**
     * Update state data
     * @param {string} stateId
     * @param {Object} data
     */
    updateStateData(stateId, data) {
        const state = this.states.get(stateId);
        if (state) {
            Object.assign(state.data, data);
        }
    }
}
