/**
 * Globe Renderer
 * STRATCOM Global Command
 * 
 * Handles 3D globe rendering with Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { COLORS, GLOBE } from '../config/constants.js';

export class GlobeRenderer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.globe = null;
        this.atmosphere = null;
        this.starField = null;
        
        // Texture management
        this.mapTexture = null;
        this.mapCanvas = null;
        this.mapContext = null;
        
        // State
        this.isInitialized = false;
        this.animationId = null;
        this.autoRotate = true;
        
        // Callbacks
        this.onReady = null;
        this.onError = null;
        
        // Performance monitoring
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;
    }
    
    /**
     * Initialize the 3D scene
     */
    async init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupControls();
            this.setupLighting();
            await this.createGlobe();
            this.createAtmosphere();
            this.createStarField();
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.animate();
            
            if (this.onReady) this.onReady();
            
            return true;
        } catch (error) {
            console.error('Globe initialization failed:', error);
            if (this.onError) this.onError(error);
            return false;
        }
    }
    
    /**
     * Set up the Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(COLORS.OCEAN_DEEP);
    }
    
    /**
     * Set up the camera
     */
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
            GLOBE.CAMERA_FOV,
            aspect,
            1,
            2000
        );
        this.camera.position.z = GLOBE.CAMERA_DISTANCE;
    }
    
    /**
     * Set up the WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Set up OrbitControls
     */
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.8;
        this.controls.panSpeed = 0.5;
        
        this.controls.minDistance = GLOBE.CAMERA_MIN_DISTANCE;
        this.controls.maxDistance = GLOBE.CAMERA_MAX_DISTANCE;
        
        // Disable panning to keep globe centered
        this.controls.enablePan = false;
        
        // Smooth zoom
        this.controls.enableZoom = true;
    }
    
    /**
     * Set up scene lighting
     */
    setupLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light simulating sun
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(100, 50, 100);
        this.scene.add(sunLight);
        
        // Subtle fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
        fillLight.position.set(-100, -50, -100);
        this.scene.add(fillLight);
        
        // Green rim light for radar aesthetic
        const rimLight = new THREE.PointLight(COLORS.PRIMARY, 0.5, 500);
        rimLight.position.set(0, 200, 0);
        this.scene.add(rimLight);
    }
    
    /**
     * Create the globe sphere with map texture
     */
    async createGlobe() {
        // Create canvas for dynamic texture
        this.mapCanvas = document.createElement('canvas');
        this.mapCanvas.width = GLOBE.TEXTURE_WIDTH;
        this.mapCanvas.height = GLOBE.TEXTURE_HEIGHT;
        this.mapContext = this.mapCanvas.getContext('2d');
        
        // Fill with ocean color initially
        this.mapContext.fillStyle = '#0a0f14';
        this.mapContext.fillRect(0, 0, GLOBE.TEXTURE_WIDTH, GLOBE.TEXTURE_HEIGHT);
        
        // Create texture from canvas
        this.mapTexture = new THREE.CanvasTexture(this.mapCanvas);
        this.mapTexture.colorSpace = THREE.SRGBColorSpace;
        this.mapTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        
        // Globe geometry
        const geometry = new THREE.SphereGeometry(
            GLOBE.RADIUS,
            GLOBE.SEGMENTS,
            GLOBE.SEGMENTS
        );
        
        // Globe material with radar-style appearance
        const material = new THREE.MeshPhongMaterial({
            map: this.mapTexture,
            bumpScale: 0.5,
            specular: new THREE.Color(0x111111),
            shininess: 5
        });
        
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
    }
    
    /**
     * Create atmosphere glow effect
     */
    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(
            GLOBE.RADIUS * GLOBE.ATMOSPHERE_SCALE,
            GLOBE.SEGMENTS,
            GLOBE.SEGMENTS
        );
        
        // Custom shader for atmosphere glow
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    vec3 glowColor = vec3(0.0, 1.0, 0.53); // #00ff88
                    gl_FragColor = vec4(glowColor, intensity * ${GLOBE.ATMOSPHERE_OPACITY});
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        
        this.atmosphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.atmosphere);
    }
    
    /**
     * Create star field background
     */
    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            // Random positions on a large sphere
            const radius = 800 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            color: COLORS.STARS,
            size: 1,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.6
        });
        
        this.starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.starField);
    }
    
    /**
     * Set up window resize and other event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    /**
     * Main animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Calculate FPS
        const now = performance.now();
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
        
        // Auto-rotate if enabled
        if (this.autoRotate && this.globe) {
            this.globe.rotation.y += GLOBE.AUTO_ROTATE_SPEED;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Update the map texture
     * @param {HTMLImageElement|SVGElement} mapImage - The map image/SVG to render
     */
    updateMapTexture(mapImage) {
        if (!this.mapContext || !this.mapTexture) return;
        
        // Clear canvas
        this.mapContext.fillStyle = '#0a0f14';
        this.mapContext.fillRect(0, 0, GLOBE.TEXTURE_WIDTH, GLOBE.TEXTURE_HEIGHT);
        
        // Draw the map
        this.mapContext.drawImage(
            mapImage,
            0, 0,
            GLOBE.TEXTURE_WIDTH,
            GLOBE.TEXTURE_HEIGHT
        );
        
        // Mark texture as needing update
        this.mapTexture.needsUpdate = true;
    }
    
    /**
     * Convert screen coordinates to lat/lon
     * @param {number} x - Screen X
     * @param {number} y - Screen Y
     * @returns {Object|null} { lat, lon } or null if not on globe
     */
    screenToLatLon(x, y) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObject(this.globe);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            
            // Convert 3D point to lat/lon
            const lat = Math.asin(point.y / GLOBE.RADIUS) * (180 / Math.PI);
            const lon = Math.atan2(point.x, point.z) * (180 / Math.PI);
            
            return { lat, lon };
        }
        
        return null;
    }
    
    /**
     * Convert screen coordinates to UV
     * @param {number} x - Screen X
     * @param {number} y - Screen Y
     * @returns {Object|null} { u, v } or null if not on globe
     */
    screenToUV(x, y) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (x / window.innerWidth) * 2 - 1,
            -(y / window.innerHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObject(this.globe);
        
        if (intersects.length > 0) {
            return intersects[0].uv;
        }
        
        return null;
    }
    
    /**
     * Get the current zoom level
     * @returns {number} Zoom multiplier
     */
    getZoomLevel() {
        const distance = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const maxZoom = GLOBE.CAMERA_MAX_DISTANCE;
        const minZoom = GLOBE.CAMERA_MIN_DISTANCE;
        const range = maxZoom - minZoom;
        const normalized = (maxZoom - distance) / range;
        return (1 + normalized * 3).toFixed(1);
    }
    
    /**
     * Get current FPS
     * @returns {number}
     */
    getFPS() {
        return this.fps;
    }
    
    /**
     * Enable/disable auto rotation
     * @param {boolean} enabled
     */
    setAutoRotate(enabled) {
        this.autoRotate = enabled;
    }
    
    /**
     * Focus camera on a specific lat/lon
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} zoom - Optional zoom level
     */
    focusOn(lat, lon, zoom = null) {
        // Convert lat/lon to 3D position
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        
        const distance = zoom || this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        
        // Calculate camera position
        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.cos(phi);
        const z = distance * Math.sin(phi) * Math.sin(theta);
        
        // Animate camera (simple linear for now)
        this.camera.position.set(-x, y, -z);
        this.controls.update();
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        // Dispose geometries and materials
        this.scene?.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}
