/**
 * A glyph simply wraps around a character a foreground color, and a background color
 * The properties can be fetched using getter methods.
 */
export default class Glyph {
  constructor(props = {}) {
    this._char = props['character'] || ' ';
    this._foreground = props['foreground'] || 'white';
    this._background = props['background'] || 'black';
  }

  getChar() {
    return this._char;
  }

  getBackground() {
    return this._background;
  }

  getForeground() {
    return this._foreground;
  }
  getRepresentation() {
    return (
      '%c{' +
      this._foreground +
      '}%b{' +
      this._background +
      '}' +
      this._char +
      '%c{white}%b{black}'
    );
  }
}
