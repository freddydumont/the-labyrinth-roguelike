import Tile from './tile';

export default class Items extends Tile {
  constructor(props = {}) {
    // Call the glyph's construtor with our set of properties
    super(props);
    this._name = props['name'] || '';
  }
}
