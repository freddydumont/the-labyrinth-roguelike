// declare map in Game namespace
Game.map = {};

/**
 * This function generates a map and stores free cells in an array
 * by using a map generation algorithm fron ROT
 * 
 * It is also responsible for creating actors on free cells
 */
Game.generateMap = function () {
  // generate map type
  let arena = new ROT.Map.Arena();

  // store empty cells as array of arrays [[x1,y1],[x2,y2],...]
  let freeCells = [];

  // create map
  mapCallback = function (x, y, wall) {
    if (!wall) {
      // store empty cells as array of arrays
      freeCells.push([x, y]);
    }
    this.display.draw(x, y, wall ? "#" : ".")
  }
  arena.create(mapCallback.bind(this));

  // call draw function
  this.drawWholeMap();

  // call function to display player on a free cell
  this.createPlayer(freeCells);
}

// iterate through all the floor tiles and draw their visual representation
Game.drawWholeMap = function () {
  for (let key in this.map) {
    let parts = key.split(",");
    let x = parseInt(parts[0]);
    let y = parseInt(parts[1]);
    this.display.draw(x, y, this.map[key]);
  }
}