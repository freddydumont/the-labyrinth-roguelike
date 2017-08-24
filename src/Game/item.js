import Glyph from './glyph';

export default class Item extends Glyph {
  constructor(props = {}) {
    // Call the glyph's construtor with our set of properties
    super(props);
    this._name = props['name'] || '';
  }
}
