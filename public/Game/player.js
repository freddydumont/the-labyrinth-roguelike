// Initialize Player in Game namespace
Game.player = null;

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

// Create player on a random free cell
Game.createPlayer = function (freeCells) {
  // random a position for Player to spawn in
  let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  var key = freeCells.splice(index, 1)[0];
  let x = key[0];
  let y = key[1];
  this.player = new Player(x, y);
}