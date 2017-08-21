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
  foreground: 'goldenrod',
  blocksLight: true
});
