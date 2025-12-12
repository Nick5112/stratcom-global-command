# Map Assets Directory

Place your SVG world map here. The game will look for maps in these locations:
- `assets/maps/world.svg`
- `assets/maps/MapChart_Map.svg`

## Recommended Map Sources

1. **MapChart.net** - https://mapchart.net/
   - Create custom world maps with state/province boundaries
   - Download as SVG (2:1 aspect ratio for equirectangular projection)
   - Each region has unique IDs for hover/click detection

2. **Natural Earth** - https://www.naturalearthdata.com/
   - High-quality cartographic data
   - Multiple detail levels available

## Map Requirements

For best results, your SVG map should:
- Be 2:1 aspect ratio (equirectangular projection)
- Have unique IDs on each state/province path element
- Use UTF-8 encoding for special characters
- Recommended resolution: 4096x2048 or higher

## Map Processing

The game will:
1. Parse the SVG and extract all path elements with IDs
2. Apply the radar theme (dark land, glowing green borders)
3. Render to a canvas texture for the 3D globe
4. Build a spatial index for hover/click detection

If no SVG map is found, the game will generate a simple procedural map.
