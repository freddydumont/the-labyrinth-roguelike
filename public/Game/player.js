
class Being {
  constructor(x, y, symbol, color) {
    this._x = x;
    this._y = y;
    this._symbol = symbol;
    this._color = color;
    this.draw();
  }
  draw() {
    Game.display.draw(this._x, this._y, this._symbol, this._color)
  }
}

class Player extends Being {
  constructor(x, y, symbol, color) {
    super(x, y, symbol, color);
  }
  act() {
    Game.engine.lock();
    // wait for user input; do stuff when user hits a key
    window.addEventListener("keydown", this);
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
    if (!(code in keyMap)) { return; }

    // If the key code is present, check whether the PC can move in that direction
    const dir = ROT.DIRS[8][keyMap[code]];
    const newX = this._x + dir[0];
    const newY = this._y + dir[1];
    const newKey = newX + "," + newY;

    // if inside map and not a wall
    if (!(newKey in Game.map) || (Game.map[newKey] == "#")) { return; }

    // redraw old position
    Game.display.draw(this._x, this._y, Game.map[this._x + "," + this._y]);

    // redraw new position
    this._x = newX;
    this._y = newY;
    this.draw();

    // turn has ended, remove event listener and unlock engine
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
  }
}

class Enemy extends Being {
  constructor(x, y, symbol, color) {
    super(x, y, symbol, color);
  }
}

// Create being on a random free cell
Game.createBeing = function (freeCells, being, symbol, color) {
  // random a position for Player to spawn in
  let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  var key = freeCells.splice(index, 1)[0];
  let x = key[0];
  let y = key[1];
  return new being(x, y, symbol, color);
}