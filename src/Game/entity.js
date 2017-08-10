import { ROT, Game } from './game';

export default class Entity {
  constructor(x, y, symbol, color) {
    this._x = x;
    this._y = y;
    this._symbol = symbol;
    this._color = color;
    this.draw();
  }
  draw() {
    Game.display.draw(this._x, this._y, this._symbol, this._color);
  }

  getX() {
    return this._x;
  }

  getY() {
    return this._y;
  }
}

// Create entity on a random free cell
export const createEntity = function(freeCells, entity, symbol, color) {
  // random a position for Player to spawn in
  let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  let key = freeCells.splice(index, 1)[0];
  let x = key[0];
  let y = key[1];
  return new entity(x, y, symbol, color);
};
