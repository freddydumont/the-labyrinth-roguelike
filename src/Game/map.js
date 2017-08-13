import { ROT, Game } from './game';
import Player from './player';
import Enemy from './enemy';
import { createEntity } from './entity';
import Tile from './tile';

class Map {
  constructor(tiles) {
    this._tiles = tiles;
    // cache the width and height based on the
    // length of the dimensions of the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
  }

  // Standard getters
  getWidth() {
    return this._width;
  }
  getHeight() {
    return this._height;
  }

  // Gets the tile for a given coordinate set
  getTile(x, y) {
    // Make sure we are inside the bounds. If we aren't, return a null tile.
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      return Tile.nullTile;
    } else {
      return this._tiles[x][y] || Game.Tile.nullTile;
    }
  }
}

/**
 * This function generates a map and stores free cells in an array
 * by using a map generation algorithm fron ROT
 * 
 * It is also responsible for creating actors on free cells
 */
export const generateMap = function() {
  let map = [];
  for (let x = 0; x < 36; x++) {
    // Create the nested array for the y values
    map.push([]);
    // Add all the tiles
    for (let y = 0; y < 25; y++) {
      map[x].push(Tile.nullTile);
    }
  }

  // generate map type
  let arena = new ROT.Map.Arena();

  // stores empty coordinates as strings in array
  let freeCells = [];

  // create map
  let mapCallback = function(x, y, wall) {
    if (!wall) {
      freeCells.push([x, y]);
      map[x][y] = Tile.floorTile;
    } else {
      map[x][y] = Tile.wallTile;
    }
  };
  arena.create(mapCallback);

  // Create our map from the tiles
  Game._map = new Map(map);
  // add freeCells to map
  Game._map.freeCells = freeCells;
};

export const renderMap = function(display) {
  // Iterate through all map cells
  for (let x = 0; x < Game._map.getWidth(); x++) {
    for (let y = 0; y < Game._map.getHeight(); y++) {
      // Fetch the glyph for the tile and render it to the screen
      let tile = Game._map.getTile(x, y);
      display.draw(
        x,
        y,
        tile.getChar(),
        tile.getForeground(),
        tile.getBackground()
      );
    }
  }

  // call function to display entity on a free cell
  Game.player = createEntity(Game._map.freeCells, Player, {
    name: 'player',
    character: '@',
    foreground: 'yellow'
  });
  Game.enemy = createEntity(Game._map.freeCells, Enemy, {
    name: 'enemy',
    character: 'E',
    foreground: 'red'
  });
};
