import { ROT, Game } from './game';
import Entity from './entity';
import Enemy from './enemy';
import { createEntity } from './entity';
import Tile from './tile';
import Mixins from './mixins';

export default class Map {
  constructor() {
    this._tiles = this.generateMap();
    // cache the width and height based on the
    // length of the dimensions of the tiles array
    this._width = this._tiles.length;
    this._height = this._tiles[0].length;
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
      return this._tiles[x][y] || Tile.nullTile;
    }
  }
  getRandomFloorPosition() {
    // Randomly generate a tile which is a floor
    var x, y;
    do {
      x = Math.floor(Math.random() * this._width);
      y = Math.floor(Math.random() * this._width);
    } while (this.getTile(x, y) !== Game.Tile.floorTile);
    return { x: x, y: y };
  }
  /**
   * This function generates a map and stores free cells in an array
   * by using a map generation algorithm fron ROT
   */
  generateMap() {
    let map = [];
    for (let x = 0; x < ROT.DEFAULT_WIDTH; x++) {
      // Create the nested array for the y values
      map.push([]);
      // Add all the tiles
      for (let y = 0; y < ROT.DEFAULT_HEIGHT; y++) {
        map[x].push(Tile.nullTile);
      }
    }

    // generate map type
    let arena = new ROT.Map.Arena();

    // create map
    let mapCallback = (x, y, wall) => {
      if (!wall) {
        // stores empty coordinates
        // add freeCells to map
        Game.map.freeCells.push([x, y]);
        map[x][y] = Tile.floorTile;
      } else {
        map[x][y] = Tile.wallTile;
      }
    };
    arena.create(mapCallback);

    return map;
  }
  // Function responsible for drawing map on display
  renderMap(display) {
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
  }

  // Function responsible for creating actors on free cells
  renderEntities() {
    // call function to display entity on a free cell
    Game.player = createEntity(Game.map.freeCells, Entity, {
      name: 'player',
      character: '@',
      foreground: 'yellow',
      mixins: [
        Mixins.Moveable,
        Mixins.PlayerAct,
        Mixins.PlayerHandleEvent,
        Mixins.NewPosition,
        Mixins.EndTurn
      ]
    });
    Game.enemy = createEntity(Game.map.freeCells, Enemy, {
      name: 'enemy',
      character: 'E',
      foreground: 'red'
    });
  }
}
