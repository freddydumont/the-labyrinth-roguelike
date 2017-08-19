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
    this._x = props['x'] || 0;
    this._y = props['y'] || 0;
    // Setup mixins
    this._attachedMixins = {};
    this.setupMixins(props);
    // draw entity on initialisation
    this.draw();
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
      return this._attachedMixins[obj];
    }
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
}

// Create entity on a random free cell
export const createEntity = function(freeCells, entity, props) {
  // random a position for Player to spawn in
  let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  let key = freeCells.splice(index, 1)[0];
  let x = key[0];
  let y = key[1];
  return new Entity({
    ...props,
    x,
    y
  });
};
