// Initialize Player in Game namespace
Game.player = null;
Game.enemy = null;

// constructor function for Player
let Player = function (x, y) {
  this._x = x;
  this._y = y;
  this.draw();
}

// define draw function in player prototype
Player.prototype.draw = function () {
  Game.display.draw(this._x, this._y, "@", "#ff0")
}

// constructor function for Enemy
let Enemy = function (x, y) {
  this._x = x;
  this._y = y;
  this.draw();
}

// define draw function in Enemy prototype
Enemy.prototype.draw = function () {
  Game.display.draw(this._x, this._y, "E", "red")
}

// act function locks the engine and waits for user input
Player.prototype.act = function () {
  console.log("test")
  
  Game.engine.lock();
  // wait for user input; do stuff when user hits a key
  window.addEventListener("keydown", this);
}

// handle user input
Player.prototype.handleEvent = function (e) {
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
  console.log("test")

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

// Create being on a random free cell
Game.createBeing = function (freeCells, being) {
  // random a position for Player to spawn in
  let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  var key = freeCells.splice(index, 1)[0];
  let x = key[0];
  let y = key[1];
  return new being(x, y);
}