import Glyph from './glyph';
/**
 * A tile contains a glyph, plus all sorts of useful information
 * such as whether characters can walk on this tile. It will
 * also describe how players can interact with the tile.
 */
export default class Tile extends Glyph {
  constructor(props = {}) {
    // call Glyph constructor, see glyph.js for expected props
    super(props);
    // Set up the properties with their defaults.
    this._walkable = props['walkable'] || false;
    this._diggable = props['diggable'] || false;
    this._blocksLight = props['blocksLight'] || false;
  }

  // Standard getters
  isWalkable() {
    return this._walkable;
  }
  isDiggable() {
    return this._diggable;
  }
  isBlockingLight() {
    return this._blocksLight;
  }
}

/**
* return a list containing all 8 neighbors of a given tile, randomized
*/
export const getNeighborPositions = function(x, y) {
  let tiles = [];
  // Generate all possible offsets
  for (let dX = -1; dX < 2; dX++) {
    for (let dY = -1; dY < 2; dY++) {
      // Make sure it isn't the same tile
      if (dX === 0 && dY === 0) {
        continue;
      }
      tiles.push({ x: x + dX, y: y + dY });
    }
  }
  return tiles.randomize();
};

// TODO: Move tiles to TileRepository instead of on Tile class
// nullTile will be returned whenever we try to access an out of bounds tiles
Tile.nullTile = new Tile({});
// floor and wall tiles
Tile.floorTile = new Tile({
  character: '.',
  walkable: true
});
Tile.wallTile = new Tile({
  character: '#',
  foreground: 'grey',
  blocksLight: true
});
Tile.stairsUpTile = new Tile({
  character: '<',
  foreground: 'white',
  isWalkable: true
});
Tile.stairsDownTile = new Tile({
  character: '>',
  foreground: 'white',
  isWalkable: true
});
