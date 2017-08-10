/**
 * For now a tile simply contains a glyph, but in the future it will keep all sorts
 * of useful information such as whether characters can walk on this tile and it will
 * also describe how players can interact with the tile.
 */
Game.Tile = class Tile {
  constructor(glyph) {
    this._glyph = glyph;
  }

  getGlyph() {
    return this._glyph;
  }
}

// nullTile will be returned whenever we try to access an out of bounds tiles
Game.Tile.nullTile = new Game.Tile(new Game.Glyph());
// floor and wall tiles
Game.Tile.floorTile = new Game.Tile(new Game.Glyph('.'));
Game.Tile.wallTile = new Game.Tile(new Game.Glyph('#', 'goldenrod'));