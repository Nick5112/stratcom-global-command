/**
 * SVG Globe Renderer
 * STRATCOM Global Command
 * 
 * Renders an SVG world map onto a 3D globe while preserving
 * individual region/country paths for game logic interaction.
 * 
 * Each region can be:
 * - Colored based on ownership
 * - Selected/clicked
 * - Updated dynamically during gameplay
 */

export class SVGGlobeRenderer {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.regions = new Map(); // regionId -> { path, owner, mesh, data }
        this.svgDoc = null;
        this.globe = null;
        this.textureCanvas = null;
        this.textureCtx = null;
        this.texture = null;
        
        // Color schemes for different ownership states
        this.ownerColors = {
            player: '#00ff88',      // Green - player controlled
            ally: '#00aaff',        // Blue - allied
            neutral: '#888888',     // Gray - neutral
            hostile: '#ff4444',     // Red - enemy
            contested: '#ffaa00',   // Orange - being fought over
            unoccupied: '#2a3a2a'   // Dark - no owner
        };
        
        // Theme colors
        this.theme = {
            ocean: '#0a1520',
            land: '#152520',
            border: '#00ff88',
            borderWidth: 1,
            selectedBorder: '#ffffff',
            selectedBorderWidth: 3
        };
    }
    
    /**
     * Load and parse SVG map file
     * @param {string} svgUrl - URL to the SVG map file
     * @returns {Promise<void>}
     */
    async loadSVG(svgUrl) {
        try {
            const response = await fetch(svgUrl);
            const svgText = await response.text();
            
            // Parse SVG
            const parser = new DOMParser();
            this.svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            
            // Extract all path elements (regions/countries)
            const paths = this.svgDoc.querySelectorAll('path');
            
            paths.forEach(path => {
                const id = path.getAttribute('id') || path.getAttribute('data-id') || `region_${this.regions.size}`;
                const name = path.getAttribute('data-name') || path.getAttribute('title') || id;
                const className = path.getAttribute('class') || '';
                
                this.regions.set(id, {
                    id: id,
                    name: name,
                    pathElement: path,
                    pathData: path.getAttribute('d'),
                    owner: 'unoccupied',
                    originalFill: path.getAttribute('fill') || '#cccccc',
                    className: className,
                    selected: false,
                    data: {} // For game-specific data like resources, troops, etc.
                });
            });
            
            console.log(`Loaded ${this.regions.size} regions from SVG`);
            return true;
        } catch (error) {
            console.error('Failed to load SVG:', error);
            return false;
        }
    }
    
    /**
     * Create the 3D globe with the SVG texture
     * @param {number} radius - Globe radius
     * @param {number} segments - Sphere segments for quality
     * @returns {THREE.Mesh}
     */
    createGlobe(radius = 1, segments = 64) {
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Create canvas for texture
        this.textureCanvas = document.createElement('canvas');
        this.textureCanvas.width = 2048;
        this.textureCanvas.height = 1024;
        this.textureCtx = this.textureCanvas.getContext('2d');
        
        // Initial render
        this.renderToCanvas();
        
        // Create texture
        this.texture = new THREE.CanvasTexture(this.textureCanvas);
        
        const material = new THREE.MeshPhongMaterial({
            map: this.texture,
            bumpScale: 0.02,
            specular: new THREE.Color(0x333333),
            shininess: 5
        });
        
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        return this.globe;
    }
    
    /**
     * Render the SVG to the canvas texture
     */
    renderToCanvas() {
        const ctx = this.textureCtx;
        const width = this.textureCanvas.width;
        const height = this.textureCanvas.height;
        
        // Clear and fill ocean
        ctx.fillStyle = this.theme.ocean;
        ctx.fillRect(0, 0, width, height);
        
        if (!this.svgDoc) {
            this.renderFallbackMap(ctx, width, height);
            return;
        }
        
        // Get SVG dimensions
        const svgElement = this.svgDoc.querySelector('svg');
        const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 2000, 1000];
        const svgWidth = viewBox[2];
        const svgHeight = viewBox[3];
        
        // Scale factors
        const scaleX = width / svgWidth;
        const scaleY = height / svgHeight;
        
        ctx.save();
        ctx.scale(scaleX, scaleY);
        
        // Render each region
        this.regions.forEach((region, id) => {
            this.renderRegion(ctx, region);
        });
        
        ctx.restore();
        
        // Add ice caps
        this.addIceCaps(ctx, width, height);
        
        // Add grid overlay
        this.addGridLines(ctx, width, height);
        
        // Update texture if exists
        if (this.texture) {
            this.texture.needsUpdate = true;
        }
    }
    
    /**
     * Render a single region to the canvas
     */
    renderRegion(ctx, region) {
        if (!region.pathData) return;
        
        const path = new Path2D(region.pathData);
        
        // Determine fill color based on owner
        let fillColor = this.theme.land;
        if (region.owner && this.ownerColors[region.owner]) {
            fillColor = this.adjustColorForLand(this.ownerColors[region.owner]);
        }
        
        // Fill region
        ctx.fillStyle = fillColor;
        ctx.fill(path);
        
        // Draw border
        ctx.strokeStyle = region.selected ? this.theme.selectedBorder : this.theme.border;
        ctx.lineWidth = region.selected ? this.theme.selectedBorderWidth : this.theme.borderWidth;
        ctx.stroke(path);
    }
    
    /**
     * Adjust a color to be darker for land mass
     */
    adjustColorForLand(hexColor) {
        // Parse hex color
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Darken by 70%
        const factor = 0.3;
        const newR = Math.floor(r * factor);
        const newG = Math.floor(g * factor);
        const newB = Math.floor(b * factor);
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    /**
     * Set the owner of a region and update visuals
     */
    setRegionOwner(regionId, owner) {
        const region = this.regions.get(regionId);
        if (region) {
            region.owner = owner;
            this.renderToCanvas();
        }
    }
    
    /**
     * Set multiple regions' owners at once
     */
    setRegionsOwner(regionIds, owner) {
        regionIds.forEach(id => {
            const region = this.regions.get(id);
            if (region) {
                region.owner = owner;
            }
        });
        this.renderToCanvas();
    }
    
    /**
     * Select a region (highlight it)
     */
    selectRegion(regionId) {
        // Deselect all first
        this.regions.forEach(region => {
            region.selected = false;
        });
        
        // Select the specified region
        const region = this.regions.get(regionId);
        if (region) {
            region.selected = true;
            this.renderToCanvas();
            return region;
        }
        return null;
    }
    
    /**
     * Get region at a specific lat/lon coordinate
     */
    getRegionAtCoordinate(lat, lon) {
        // Convert lat/lon to canvas coordinates
        const x = ((lon + 180) / 360) * this.textureCanvas.width;
        const y = ((90 - lat) / 180) * this.textureCanvas.height;
        
        // Check each region's path
        for (const [id, region] of this.regions) {
            if (region.pathData) {
                const path = new Path2D(region.pathData);
                
                // Scale coordinates
                const svgElement = this.svgDoc?.querySelector('svg');
                const viewBox = svgElement?.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 2000, 1000];
                const scaleX = viewBox[2] / this.textureCanvas.width;
                const scaleY = viewBox[3] / this.textureCanvas.height;
                
                if (this.textureCtx.isPointInPath(path, x * scaleX, y * scaleY)) {
                    return region;
                }
            }
        }
        return null;
    }
    
    /**
     * Get all regions owned by a specific owner
     */
    getRegionsByOwner(owner) {
        const result = [];
        this.regions.forEach((region, id) => {
            if (region.owner === owner) {
                result.push(region);
            }
        });
        return result;
    }
    
    /**
     * Add ice caps to hide polar distortion
     */
    addIceCaps(ctx, width, height) {
        // North pole ice cap
        const northCapGradient = ctx.createLinearGradient(0, 0, 0, height * 0.15);
        northCapGradient.addColorStop(0, 'rgba(180, 200, 230, 0.95)');
        northCapGradient.addColorStop(0.5, 'rgba(150, 180, 210, 0.7)');
        northCapGradient.addColorStop(1, 'rgba(100, 140, 180, 0)');
        
        ctx.fillStyle = northCapGradient;
        ctx.fillRect(0, 0, width, height * 0.15);
        
        // Irregular ice edge
        ctx.fillStyle = 'rgba(200, 220, 240, 0.8)';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.08);
        for (let x = 0; x <= width; x += 40) {
            const y = height * 0.08 + Math.sin(x * 0.015) * 12 + Math.sin(x * 0.03) * 8;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        // South pole ice cap
        const southCapGradient = ctx.createLinearGradient(0, height, 0, height * 0.92);
        southCapGradient.addColorStop(0, 'rgba(200, 220, 240, 0.9)');
        southCapGradient.addColorStop(1, 'rgba(150, 180, 210, 0)');
        
        ctx.fillStyle = southCapGradient;
        ctx.fillRect(0, height * 0.92, width, height * 0.08);
    }
    
    /**
     * Add grid lines overlay
     */
    addGridLines(ctx, width, height) {
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.lineWidth = 1;
        
        // Latitude lines (every 10 degrees)
        for (let i = 0; i <= 18; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * (height / 18));
            ctx.lineTo(width, i * (height / 18));
            ctx.stroke();
        }
        
        // Longitude lines (every 10 degrees)
        for (let i = 0; i <= 36; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (width / 36), 0);
            ctx.lineTo(i * (width / 36), height);
            ctx.stroke();
        }
    }
    
    /**
     * Render fallback procedural map if SVG fails to load
     */
    renderFallbackMap(ctx, width, height) {
        // Ocean
        ctx.fillStyle = this.theme.ocean;
        ctx.fillRect(0, 0, width, height);
        
        // Simplified continents
        const continents = [
            { name: 'North America', points: [[0.1, 0.15], [0.25, 0.1], [0.3, 0.2], [0.27, 0.4], [0.17, 0.45], [0.07, 0.3]] },
            { name: 'South America', points: [[0.2, 0.5], [0.25, 0.48], [0.26, 0.7], [0.22, 0.85], [0.17, 0.8], [0.19, 0.6]] },
            { name: 'Europe', points: [[0.45, 0.12], [0.55, 0.1], [0.57, 0.2], [0.55, 0.3], [0.47, 0.28], [0.44, 0.18]] },
            { name: 'Africa', points: [[0.45, 0.35], [0.55, 0.32], [0.57, 0.5], [0.52, 0.7], [0.45, 0.68], [0.42, 0.5]] },
            { name: 'Asia', points: [[0.57, 0.1], [0.8, 0.08], [0.85, 0.2], [0.82, 0.4], [0.7, 0.45], [0.6, 0.35], [0.55, 0.2]] },
            { name: 'Australia', points: [[0.75, 0.6], [0.82, 0.58], [0.85, 0.7], [0.8, 0.78], [0.74, 0.75]] }
        ];
        
        ctx.fillStyle = this.theme.land;
        ctx.strokeStyle = this.theme.border;
        ctx.lineWidth = 2;
        
        continents.forEach(continent => {
            ctx.beginPath();
            const firstPoint = continent.points[0];
            ctx.moveTo(firstPoint[0] * width, firstPoint[1] * height);
            continent.points.forEach(point => {
                ctx.lineTo(point[0] * width, point[1] * height);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
        
        // Add ice caps
        this.addIceCaps(ctx, width, height);
        
        // Add grid
        this.addGridLines(ctx, width, height);
    }
    
    /**
     * Get all region IDs
     */
    getAllRegionIds() {
        return Array.from(this.regions.keys());
    }
    
    /**
     * Get region data by ID
     */
    getRegion(regionId) {
        return this.regions.get(regionId);
    }
    
    /**
     * Update the texture (call after any changes)
     */
    updateTexture() {
        this.renderToCanvas();
    }
}

export default SVGGlobeRenderer;
