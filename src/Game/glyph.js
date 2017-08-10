/**
 * A glyph simply wraps around a character a foreground color, and a background color
 * The properties can be fetched using getter methods.
 */
Game.Glyph = class Glyph {
  constructor(chr = ' ', foreground = 'white', background = 'black') {
    this._chr = chr;
    this._foreground = foreground;
    this._background = background;
  }

  getChar() {
    return this._chr;
  }

  getBackground() {
    return this._background;
  }

  getForeground() {
    return this._foreground;
  }
};
