import Glyph from './glyph';

export default class Item extends Glyph {
  constructor(props = {}) {
    // Call the glyph's construtor with our set of properties
    super(props);
    this._name = props['name'] || '';
  }

  describe() {
    return this._name;
  }

  /**
   * Returns the name of the item preceded by 'a' or 'an'
   */
  describeA(capitalize) {
    // Optional parameter to capitalize the a/an.
    const prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    const name = this.describe();
    const firstLetter = name.charAt(0).toLowerCase();
    // If word starts by a vowel, use an, else use a. Note that this is not perfect.
    const prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;

    return prefixes[prefix] + ' ' + name;
  }
}
