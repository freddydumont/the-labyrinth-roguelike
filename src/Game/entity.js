import Glyph from './glyph';

/**
 * A basic entity is composed of a glyph as well as a position and a name (used in messages).
 * An entity can be anything. Ex. Player, enemy, items, etc
 */
export default class Entity extends Glyph {
  constructor(props) {
    super(props);
    // Instantiate any properties from the passed object
    this._name = props['name'] || '';
    this._x = props['x'] || 0;
    this._y = props['y'] || 0;
    this._z = props['z'] || 0;
    this._map = null;
    // Create an object which will keep track what mixins we have
    // attached to this entity based on the name property
    this._attachedMixins = {};
    // Create a similar object for groups
    this._attachedMixinGroups = {};
    // Setup the object's mixins
    this.setupMixins(props);
  }

  // Mixin functions
  setupMixins(props) {
    let mixins = props['mixins'] || [];
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
    // Allow passing the mixin itself or the name as a string
    if (typeof obj === 'object') {
      return this._attachedMixins[obj.name];
    } else {
      return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
  }

  setPosition(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  // setters
  setName(name) {
    this._name = name;
  }
  setX(x) {
    this._x = x;
  }
  setY(y) {
    this._y = y;
  }
  setZ(z) {
    this._z = z;
  }
  setMap(map) {
    this._map = map;
  }

  // getters
  getName() {
    return this._name;
  }
  getX() {
    return this._x;
  }
  getY() {
    return this._y;
  }
  getZ() {
    return this._z;
  }
  getMap() {
    return this._map;
  }
}
