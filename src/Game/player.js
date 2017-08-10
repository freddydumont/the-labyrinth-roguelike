import { ROT, Game } from './game';

class Being {
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

export class Player extends Being {
  constructor(x, y, symbol = '@', color = 'yellow') {
    super(x, y, symbol, color);
  }
  act() {
    Game.engine.lock();
    // wait for user input; do stuff when user hits a key
    window.addEventListener('keydown', this);
  }

  handleEvent(e) {
    let keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    const code = e.keyCode;

    // If the key code is not present in keyMap, do nothing
    if (!(code in keyMap)) {
      return;
    }

    // If the key code is present, check whether the PC can move in that direction
    const dir = ROT.DIRS[8][keyMap[code]];
    const newX = this._x + dir[0];
    const newY = this._y + dir[1];
    const newKey = newX + ',' + newY;

    // if inside map and not a wall
    if (!(newKey in Game.map) || Game.map[newKey] === '#') {
      return;
    }

    // redraw old position
    Game.display.draw(this._x, this._y, Game.map[this._x + ',' + this._y]);

    // redraw new position
    this._x = newX;
    this._y = newY;
    this.draw();

    console.log('player:', this.getX(), this.getY());
    console.log('enemy:', Game.enemy.getX(), Game.enemy.getY());
    // turn has ended, remove event listener and unlock engine
    window.removeEventListener('keydown', this);
    Game.engine.unlock();
  }
}

export class Enemy extends Being {
  // TODO: Add field of view
  act() {
    // get player coodinates
    let x = Game.player.getX();
    let y = Game.player.getY();

    // passableCallback tells the pathfinder what areas are passable
    // TODO: update with Game.passableCells when available
    const passableCallback = function(x, y) {
      return x + ',' + y in Game.map;
    };

    // patchfinding algorithm -- topology makes the enemy move in 4 directions only
    const astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 });

    // compute finds the shortest path and pushes it to path
    let path = [];
    const pathCallback = function(x, y) {
      path.push([x, y]);
    };
    astar.compute(this._x, this._y, pathCallback);

    // remove enemy position
    path.shift();

    if (path.length === 1) {
      // enemy and player and next to each other
      // Game.engine.lock();
      console.log('collision imminent');
    } else {
      // get first coordinates of the path
      x = path[0][0];
      y = path[0][1];

      // redraw old position
      Game.display.draw(this._x, this._y, Game.map[this._x + ',' + this._y]);

      // draw enemy at new position
      this._x = x;
      this._y = y;
      this.draw();
    }
  }
}

// Create being on a random free cell
export const createBeing = function(freeCells, being, symbol, color) {
  // random a position for Player to spawn in
  let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  let key = freeCells.splice(index, 1)[0];
  let x = key[0];
  let y = key[1];
  return new being(x, y, symbol, color);
};
