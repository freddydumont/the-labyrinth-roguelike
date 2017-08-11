import Glyph from './glyph';
/**
 * For now a tile simply contains a glyph, but in the future it will keep all sorts
 * of useful information such as whether characters can walk on this tile and it will
 * also describe how players can interact with the tile.
 */
export default class Tile {
  constructor(glyph) {
    this._glyph = glyph;
  }

  getGlyph() {
    return this._glyph;
  }
}

// nullTile will be returned whenever we try to access an out of bounds tiles
Tile.nullTile = new Tile(new Glyph());
// floor and wall tiles
Tile.floorTile = new Tile(new Glyph('.'));
Tile.wallTile = new Tile(new Glyph('#', 'goldenrod'));
