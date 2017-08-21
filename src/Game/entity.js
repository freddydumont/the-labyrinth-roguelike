import { ROT, Game } from './game';
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
    this._map = null;
    // find empty tile for entity
    this.createEntity();
    // Setup mixins
    this._attachedMixins = {};
    this._attachedMixinGroups = {};
    this.setupMixins(props);
    // draw entity on initialisation
    this.draw();
    // add entity to our list of entities
    Game._map.entities.push(this);
  }
  act() {
    // Warning if entity is calling a non-existent act from scheduler
    console.warn(this._name + ' has no act function.');
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
  hasMixins(obj) {
    // Allow passing the mixin itself or the name as a string
    if (typeof obj === 'object') {
      return this._attachedMixins[obj.name];
    } else {
      return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
  }
  // Create entity on a random free cell
  createEntity() {
    // random a position for Player to spawn in
    let index = Math.floor(ROT.RNG.getUniform() * Game._map.freeCells.length);
    let key = Game._map.freeCells.splice(index, 1)[0];
    this._x = key[0] || 0;
    this._y = key[1] || 0;
    this.setMap(Game._map);
  }
  // Draws character on display
  draw() {
    Game.display.draw(this._x, this._y, ['.', this._char], this._foreground);
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
  getMap() {
    return this._map;
  }
}
