import DynamicGlyph from './dynamicglyph';

export default class Item extends DynamicGlyph {
  constructor(props = {}) {
    // Call the glyph's construtor with our set of properties
    super(props);
    // Weighted values by level (percentage of chance an item spawns)
    this._weightedValues = props['weightedValues'] || [];
  }

  setWeightedValues(values) {
    this._weightedValues = values;
  }

  getWeightedValues() {
    return this._weightedValues;
  }
}
