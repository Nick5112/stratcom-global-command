/**
 * Game Constants
 * STRATCOM Global Command
 */

// Visual theme colors matching CSS
export const COLORS = {
    PRIMARY: 0x00ff88,
    PRIMARY_DIM: 0x00cc6a,
    PRIMARY_GLOW: 0x00ff88,
    
    OCEAN: 0x0a0f14,
    OCEAN_DEEP: 0x050a0f,
    
    LAND_DEFAULT: 0x1a2520,
    LAND_HOVER: 0x2a3530,
    LAND_SELECTED: 0x3a4540,
    
    BORDER_GLOW: 0x00ff88,
    BORDER_DIM: 0x006633,
    
    ATMOSPHERE: 0x00ff88,
    STARS: 0xffffff,
    
    // Nation colors (will be assigned dynamically)
    NATION_PALETTE: [
        0x1a4a3a, // Dark teal
        0x2a3a4a, // Dark blue
        0x3a2a4a, // Dark purple
        0x4a3a2a, // Dark orange
        0x4a2a3a, // Dark pink
        0x2a4a3a, // Sea green
        0x3a4a2a, // Olive
        0x4a4a2a, // Dark yellow
    ]
};

// Globe rendering settings
export const GLOBE = {
    RADIUS: 100,
    SEGMENTS: 64,
    
    // Camera
    CAMERA_DISTANCE: 300,
    CAMERA_MIN_DISTANCE: 120,
    CAMERA_MAX_DISTANCE: 500,
    CAMERA_FOV: 45,
    
    // Texture
    TEXTURE_WIDTH: 4096,
    TEXTURE_HEIGHT: 2048,
    
    // Atmosphere
    ATMOSPHERE_SCALE: 1.15,
    ATMOSPHERE_OPACITY: 0.15,
    
    // Rotation
    AUTO_ROTATE_SPEED: 0.0005,
    
    // Border rendering
    BORDER_WIDTH: 1.5,
    BORDER_GLOW_WIDTH: 3,
    
    // State colors
    STATE_OPACITY: 0.85
};

// Resource types
export const RESOURCES = {
    OIL: { id: 'oil', name: 'Oil', icon: '🛢️', color: 0x1a1a1a },
    STEEL: { id: 'steel', name: 'Steel', icon: '⚙️', color: 0x666666 },
    ALUMINUM: { id: 'aluminum', name: 'Aluminum', icon: '🔩', color: 0xcccccc },
    RUBBER: { id: 'rubber', name: 'Rubber', icon: '⚫', color: 0x333333 },
    TUNGSTEN: { id: 'tungsten', name: 'Tungsten', icon: '💎', color: 0x888888 },
    CHROMIUM: { id: 'chromium', name: 'Chromium', icon: '✨', color: 0xaaaaaa },
    URANIUM: { id: 'uranium', name: 'Uranium', icon: '☢️', color: 0x00ff00 }
};

// Building types
export const BUILDINGS = {
    FACTORY: { id: 'factory', name: 'Civilian Factory', icon: '🏭', buildTime: 180 },
    MILITARY_FACTORY: { id: 'military_factory', name: 'Military Factory', icon: '⚔️', buildTime: 180 },
    DOCKYARD: { id: 'dockyard', name: 'Dockyard', icon: '⚓', buildTime: 270 },
    AIRBASE: { id: 'airbase', name: 'Air Base', icon: '✈️', buildTime: 90 },
    NAVAL_BASE: { id: 'naval_base', name: 'Naval Base', icon: '🚢', buildTime: 120 },
    RADAR: { id: 'radar', name: 'Radar Station', icon: '📡', buildTime: 60 },
    INFRASTRUCTURE: { id: 'infrastructure', name: 'Infrastructure', icon: '🛣️', buildTime: 120 },
    FORT: { id: 'fort', name: 'Fort', icon: '🏰', buildTime: 90 },
    ANTI_AIR: { id: 'anti_air', name: 'Anti-Air', icon: '🎯', buildTime: 45 }
};

// Map layer modes
export const MAP_MODES = {
    POLITICAL: 'political',
    TERRAIN: 'terrain',
    RESOURCES: 'resources',
    INFRASTRUCTURE: 'infrastructure',
    MILITARY: 'military',
    POPULATION: 'population',
    SUPPLY: 'supply'
};

// Key bindings
export const KEYS = {
    PAUSE: ' ', // Space
    SPEED_UP: '+',
    SPEED_DOWN: '-',
    MAP_MODE_1: '1',
    MAP_MODE_2: '2',
    MAP_MODE_3: '3',
    MAP_MODE_4: '4',
    MAP_MODE_5: '5',
    ESCAPE: 'Escape'
};
