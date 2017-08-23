import Glpyhs from './glpyh';

export default class Items extends Glpyhs {
  constructor(props = {}) {
    // Call the glyph's construtor with our set of properties
    super(props);
    this._name = props['name'] || '';
  }
}
