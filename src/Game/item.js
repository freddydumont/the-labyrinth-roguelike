import Glpyh from './glpyh';

export default class Items extends Glpyh {
  constructor(props = {}) {
    // Call the glyph's construtor with our set of properties
    super(props);
    this._name = props['name'] || '';
  }
}
