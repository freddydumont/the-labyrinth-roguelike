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
    // draw entity on initialisation
    this.draw();
  }

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
  return new entity({
    ...props,
    x,
    y
  });
};
