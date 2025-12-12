# STRATCOM Global Command

A browser-based multiplayer grand strategy game inspired by Hearts of Iron 4 and Paradox Interactive games.

## 🌍 Overview

Control nations, manage territories, and compete for global dominance on a 3D interactive globe with a military command terminal aesthetic.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-ISC-blue)

## 🎮 Features

### Current (Phase 1)
- ✅ 3D globe rendering with Three.js
- ✅ Military radar/terminal aesthetic
- ✅ SVG map support with state boundaries
- ✅ Territory hover/click detection
- ✅ Responsive HUD with game controls
- ✅ Firebase Hosting ready

### Planned (Phase 2-3)
- 🔲 Firestore integration for persistent game state
- 🔲 Firebase Auth for player accounts
- 🔲 Territory ownership system
- 🔲 Nation stats and resources
- 🔲 Turn-based game mechanics
- 🔲 Multiplayer support
- 🔲 Cloud Functions for game logic

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

### Setup

1. **Clone and install:**
   ```bash
   cd grand-strategy-game
   npm install
   ```

2. **Configure Firebase:**
   - Create a Firebase project at https://console.firebase.google.com
   - Update `.firebaserc` with your project ID
   - Update `public/js/config/firebase.config.js` with your config

3. **Add a map (optional):**
   - Download an SVG world map from MapChart.net
   - Place it in `public/assets/maps/world.svg`

4. **Run locally:**
   ```bash
   npm run serve
   ```
   
   Or with emulators:
   ```bash
   npm run emulators
   ```

5. **Deploy:**
   ```bash
   npm run deploy
   ```

## 📁 Project Structure

```
grand-strategy-game/
├── public/                    # Hosted files
│   ├── index.html            # Main HTML
│   ├── css/
│   │   ├── main.css          # Core styles
│   │   ├── hud.css           # HUD components
│   │   └── terminal.css      # Terminal effects
│   ├── js/
│   │   ├── main.js           # Entry point
│   │   ├── config/
│   │   │   ├── firebase.config.js
│   │   │   └── constants.js
│   │   ├── core/
│   │   │   ├── GlobeRenderer.js
│   │   │   ├── MapManager.js
│   │   │   ├── InputHandler.js
│   │   │   └── HUDController.js
│   │   └── data/
│   │       └── worldData.js
│   └── assets/
│       └── maps/
├── functions/                 # Cloud Functions (Phase 3)
├── firebase.json             # Firebase config
├── firestore.rules           # Security rules
├── firestore.indexes.json    # Database indexes
└── package.json
```

## 🎨 Visual Theme

The game features a **Military Command Terminal** aesthetic:
- Dark radar/satellite imagery style
- Near-black ocean (#0a0f14)
- Dark earth-tone landmasses (#1a2520)
- Glowing green UI elements (#00ff88)
- Scanline effects and terminal typography
- Tactical HUD with coordinate displays

## 🛠 Tech Stack

- **Frontend:** Vanilla JavaScript (ES Modules)
- **3D Rendering:** Three.js
- **Backend:** Firebase (Hosting, Firestore, Auth, Functions)
- **Maps:** SVG with equirectangular projection

## 🎯 Controls

| Key | Action |
|-----|--------|
| Mouse Drag | Rotate globe |
| Scroll | Zoom in/out |
| Click | Select territory |
| Right-click | Deselect |
| Space | Pause/Play |
| +/- | Change game speed |
| Escape | Deselect/Close |

## 📖 Architecture Notes

### Globe Rendering
The globe uses Three.js with a sphere geometry. SVG maps (2:1 equirectangular) are rendered to a canvas, then applied as a texture.

### Territory Detection
Mouse position → Ray casting → UV coordinates → Lat/Lon → Spatial grid lookup → Closest centroid match

### State Management
Game state will be stored in Firestore with real-time listeners for multiplayer sync. Security rules ensure only Cloud Functions can modify game state.

## 🤝 Contributing

This is a personal project, but suggestions and ideas are welcome!

## 📄 License

ISC License

---

*"Global domination awaits, Commander."*
