import { ROT, Game } from './game';
import Player from './player';
import Enemy from './enemy';
import { createEntity } from './entity';
/**
 * This function generates a map and stores free cells in an array
 * by using a map generation algorithm fron ROT
 * 
 * It is also responsible for creating actors on free cells
 */
export const generateMap = function() {
  // generate map type
  let arena = new ROT.Map.Arena(Game.gameW, Game.gameH);

  // stores empty coordinates as strings in array
  let freeCells = [];

  // create map
  let mapCallback = function(x, y, wall) {
    let key = x + ',' + y;

    if (!wall) {
      freeCells.push([x, y]);
      Game.map[key] = '.';
    } else {
      Game.map[key] = '#';
    }
  };
  arena.create(mapCallback);

  // call draw function
  _drawWholeMap();

  // call function to display entity on a free cell
  Game.player = createEntity(freeCells, Player);
  Game.enemy = createEntity(freeCells, Enemy, 'E', 'red');
};

// iterate through all the floor tiles and draw their visual representation
const _drawWholeMap = function() {
  for (let key in Game.map) {
    let parts = key.split(',');
    let x = parseInt(parts[0], 10);
    let y = parseInt(parts[1], 10);
    Game.display.draw(x, y, Game.map[key]);
  }
};
