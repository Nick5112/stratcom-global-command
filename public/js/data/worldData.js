/**
 * Sample World Data
 * STRATCOM Global Command
 * 
 * This file contains sample nation and territory data.
 * In production, this would come from Firestore.
 */

export const NATIONS = {
    USA: {
        id: 'USA',
        name: 'United States of America',
        flag: '🇺🇸',
        color: '#2a3a4a',
        capital: 'Washington D.C.',
        type: 'FEDERAL REPUBLIC',
        stats: {
            population: 331000000,
            gdp: 25460,
            military: 1400000,
            stability: 72
        }
    },
    CHN: {
        id: 'CHN',
        name: 'People\'s Republic of China',
        flag: '🇨🇳',
        color: '#4a2a2a',
        capital: 'Beijing',
        type: 'COMMUNIST STATE',
        stats: {
            population: 1412000000,
            gdp: 17960,
            military: 2035000,
            stability: 85
        }
    },
    RUS: {
        id: 'RUS',
        name: 'Russian Federation',
        flag: '🇷🇺',
        color: '#2a4a3a',
        capital: 'Moscow',
        type: 'FEDERAL REPUBLIC',
        stats: {
            population: 144000000,
            gdp: 1780,
            military: 900000,
            stability: 68
        }
    },
    DEU: {
        id: 'DEU',
        name: 'Germany',
        flag: '🇩🇪',
        color: '#3a3a2a',
        capital: 'Berlin',
        type: 'FEDERAL REPUBLIC',
        stats: {
            population: 83000000,
            gdp: 4070,
            military: 184000,
            stability: 78
        }
    },
    GBR: {
        id: 'GBR',
        name: 'United Kingdom',
        flag: '🇬🇧',
        color: '#2a2a4a',
        capital: 'London',
        type: 'CONSTITUTIONAL MONARCHY',
        stats: {
            population: 67000000,
            gdp: 3070,
            military: 153000,
            stability: 71
        }
    },
    FRA: {
        id: 'FRA',
        name: 'France',
        flag: '🇫🇷',
        color: '#2a3a5a',
        capital: 'Paris',
        type: 'REPUBLIC',
        stats: {
            population: 67000000,
            gdp: 2780,
            military: 203000,
            stability: 65
        }
    },
    JPN: {
        id: 'JPN',
        name: 'Japan',
        flag: '🇯🇵',
        color: '#4a4a2a',
        capital: 'Tokyo',
        type: 'CONSTITUTIONAL MONARCHY',
        stats: {
            population: 125000000,
            gdp: 4230,
            military: 247000,
            stability: 82
        }
    },
    IND: {
        id: 'IND',
        name: 'India',
        flag: '🇮🇳',
        color: '#4a3a2a',
        capital: 'New Delhi',
        type: 'FEDERAL REPUBLIC',
        stats: {
            population: 1380000000,
            gdp: 3390,
            military: 1455000,
            stability: 70
        }
    },
    BRA: {
        id: 'BRA',
        name: 'Brazil',
        flag: '🇧🇷',
        color: '#2a4a2a',
        capital: 'Brasília',
        type: 'FEDERAL REPUBLIC',
        stats: {
            population: 214000000,
            gdp: 1920,
            military: 360000,
            stability: 58
        }
    },
    AUS: {
        id: 'AUS',
        name: 'Australia',
        flag: '🇦🇺',
        color: '#3a4a3a',
        capital: 'Canberra',
        type: 'CONSTITUTIONAL MONARCHY',
        stats: {
            population: 26000000,
            gdp: 1550,
            military: 59000,
            stability: 85
        }
    }
};

// Sample territories with coordinates (centroids)
export const TERRITORIES = {
    // United States
    'US-CA': {
        id: 'US-CA',
        name: 'California',
        nation: 'USA',
        centroid: { lat: 36.7783, lon: -119.4179 },
        population: 39500000,
        resources: { oil: 3, steel: 1 },
        buildings: { factories: 15, infrastructure: 8 }
    },
    'US-TX': {
        id: 'US-TX',
        name: 'Texas',
        nation: 'USA',
        centroid: { lat: 31.9686, lon: -99.9018 },
        population: 29100000,
        resources: { oil: 8, steel: 2 },
        buildings: { factories: 12, infrastructure: 7 }
    },
    'US-NY': {
        id: 'US-NY',
        name: 'New York',
        nation: 'USA',
        centroid: { lat: 43.2994, lon: -74.2179 },
        population: 20200000,
        resources: { steel: 2 },
        buildings: { factories: 10, infrastructure: 9 }
    },
    
    // China
    'CN-BJ': {
        id: 'CN-BJ',
        name: 'Beijing',
        nation: 'CHN',
        centroid: { lat: 39.9042, lon: 116.4074 },
        population: 21500000,
        resources: { steel: 3 },
        buildings: { factories: 8, infrastructure: 9 }
    },
    'CN-SH': {
        id: 'CN-SH',
        name: 'Shanghai',
        nation: 'CHN',
        centroid: { lat: 31.2304, lon: 121.4737 },
        population: 24900000,
        resources: { steel: 2 },
        buildings: { factories: 15, infrastructure: 10 }
    },
    
    // Russia
    'RU-MOW': {
        id: 'RU-MOW',
        name: 'Moscow Oblast',
        nation: 'RUS',
        centroid: { lat: 55.7558, lon: 37.6173 },
        population: 12600000,
        resources: { oil: 2, steel: 4 },
        buildings: { factories: 10, infrastructure: 7 }
    },
    'RU-TYU': {
        id: 'RU-TYU',
        name: 'Tyumen Oblast',
        nation: 'RUS',
        centroid: { lat: 57.1530, lon: 65.5343 },
        population: 3700000,
        resources: { oil: 10, steel: 1 },
        buildings: { factories: 2, infrastructure: 4 }
    },
    
    // Germany
    'DE-BY': {
        id: 'DE-BY',
        name: 'Bavaria',
        nation: 'DEU',
        centroid: { lat: 48.7904, lon: 11.4979 },
        population: 13100000,
        resources: { steel: 2 },
        buildings: { factories: 8, infrastructure: 9 }
    },
    'DE-NW': {
        id: 'DE-NW',
        name: 'North Rhine-Westphalia',
        nation: 'DEU',
        centroid: { lat: 51.4332, lon: 7.6616 },
        population: 17900000,
        resources: { steel: 5 },
        buildings: { factories: 12, infrastructure: 9 }
    },
    
    // United Kingdom
    'GB-ENG': {
        id: 'GB-ENG',
        name: 'England',
        nation: 'GBR',
        centroid: { lat: 52.3555, lon: -1.1743 },
        population: 56000000,
        resources: { steel: 2, oil: 1 },
        buildings: { factories: 10, infrastructure: 8 }
    },
    'GB-SCT': {
        id: 'GB-SCT',
        name: 'Scotland',
        nation: 'GBR',
        centroid: { lat: 56.4907, lon: -4.2026 },
        population: 5500000,
        resources: { oil: 4 },
        buildings: { factories: 3, infrastructure: 6 }
    },
    
    // Japan
    'JP-13': {
        id: 'JP-13',
        name: 'Tokyo',
        nation: 'JPN',
        centroid: { lat: 35.6762, lon: 139.6503 },
        population: 14000000,
        resources: {},
        buildings: { factories: 12, infrastructure: 10 }
    },
    'JP-27': {
        id: 'JP-27',
        name: 'Osaka',
        nation: 'JPN',
        centroid: { lat: 34.6937, lon: 135.5023 },
        population: 8800000,
        resources: { steel: 1 },
        buildings: { factories: 8, infrastructure: 9 }
    }
};

// Generate nation colors map
export function getNationColors() {
    const colors = new Map();
    Object.values(NATIONS).forEach(nation => {
        colors.set(nation.id, nation.color);
    });
    return colors;
}

// Generate territory ownership map
export function getTerritoryOwnership() {
    const ownership = new Map();
    Object.values(TERRITORIES).forEach(territory => {
        ownership.set(territory.id, territory.nation);
    });
    return ownership;
}

// Get territory centroids for spatial index
export function getTerritoryCentroids() {
    return Object.values(TERRITORIES).map(t => ({
        id: t.id,
        centroid: t.centroid
    }));
}
