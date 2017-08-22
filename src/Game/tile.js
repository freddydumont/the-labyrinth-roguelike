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
    // Set up the properties. We use false by default.
    this._isWalkable = props['isWalkable'] || false;
    this._isDiggable = props['isDiggable'] || false;
  }

  // Standard getters
  isWalkable() {
    return this._isWalkable;
  }
  isDiggable() {
    return this._isDiggable;
  }
}

// TODO: Move tiles to TileRepository instead of on Tile class
// nullTile will be returned whenever we try to access an out of bounds tiles
Tile.nullTile = new Tile({});
// floor and wall tiles
Tile.floorTile = new Tile({
  character: '.',
  isWalkable: true
});
Tile.wallTile = new Tile({
  character: '#',
  foreground: 'goldenrod'
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
