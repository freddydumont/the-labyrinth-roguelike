import Glyph from './glyph';

export default class DynamicGlyph extends Glyph {
  constructor(props = {}) {
    // Instantiate any properties from the passed object
    super(props);
    this._name = props['name'] || '';
    // Create an object which will keep track what mixins we have
    // attached to this entity based on the name property
    this._attachedMixins = {};
    // Create a similar object for groups
    this._attachedMixinGroups = {};
    // Setup the object's mixins
    var mixins = props['mixins'] || [];
    for (let i = 0; i < mixins.length; i++) {
      // Copy over all properties from each mixin as long
      // as it's not the name or the init property. We
      // also make sure not to override a property that
      // already exists on the entity.
      for (let key in mixins[i]) {
        if (key !== 'init' && key !== 'name' && !this.hasOwnProperty(key)) {
          this[key] = mixins[i][key];
        }
      }
      // Add the name of this mixin to our attached mixins
      this._attachedMixins[mixins[i].name] = true;
      // If a group name is present, add it
      if (mixins[i].groupName) {
        this._attachedMixinGroups[mixins[i].groupName] = true;
      }
      // Finally call the init function if there is one
      if (mixins[i].init) {
        mixins[i].init.call(this, props);
      }
    }
  }

  hasMixin(obj) {
    // Allow passing the mixin itself or the name / group name as a string
    if (typeof obj === 'object') {
      return this._attachedMixins[obj.name];
    } else {
      return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
  }

  setName(name) {
    this._name = name;
  }

  getName() {
    return this._name;
  }

  describe() {
    return this._name;
  }

  describeA(capitalize) {
    // Optional parameter to capitalize the a/an.
    const prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    const string = this.describe();
    const firstLetter = string.charAt(0).toLowerCase();
    // If word starts by a vowel, use an, else use a. Note that this is not perfect.
    const prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;

    return prefixes[prefix] + ' ' + string;
  }

  describeThe(capitalize) {
    const prefix = capitalize ? 'The' : 'the';
    return prefix + ' ' + this.describe();
  }
}
