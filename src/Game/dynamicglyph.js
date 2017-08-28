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
    // Set up an object for listeners
    this._listeners = {};

    // Setup the object's mixins
    const mixins = props['mixins'] || [];
    for (let i = 0; i < mixins.length; i++) {
      // Copy over all properties from each mixin as long as it's not the name,
      // init, or listeners property. We also make sure not to override
      // a property that already exists on the entity.
      for (let key in mixins[i]) {
        if (
          key !== 'init' &&
          key !== 'name' &&
          key !== 'listeners' &&
          !this.hasOwnProperty(key)
        ) {
          this[key] = mixins[i][key];
        }
      }

      // Add the name of this mixin to our attached mixins
      this._attachedMixins[mixins[i].name] = true;
      // If a group name is present, add it
      if (mixins[i].groupName) {
        this._attachedMixinGroups[mixins[i].groupName] = true;
      }

      // Add all of our listeners
      if (mixins[i].listeners) {
        for (let key in mixins[i].listeners) {
          // If there's no key for this event in our listeners array, add it.
          if (!this._listeners[key]) {
            this._listeners[key] = [];
          }
          // Add the listener.
          this._listeners[key].push(mixins[i].listeners[key]);
        }
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

  raiseEvent(event, ...args) {
    // Make sure we have at least one listener, or else exit
    if (!this._listeners[event]) {
      return;
    }
    // Invoke each listener, with this entity as the context and the arguments
    for (let i = 0; i < this._listeners[event].length; i++) {
      this._listeners[event][i].apply(this, args);
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
