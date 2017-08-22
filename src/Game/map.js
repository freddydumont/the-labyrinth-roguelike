import { ROT, Game } from './game';
import Entity from './entity';
// import { createEntity } from './entity';
import Tile from './tile';
import Entities from './entities';

export default class Map {
  constructor(tiles, player) {
    this._tiles = tiles;
    // cache the width and height based on the
    // length of the dimensions of the tiles array
    this._width = this._tiles.length;
    this._height = this._tiles[0].length;
    // create a list which will hold the entities
    this._entities = [];
    // create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);
    // add the player
    this.addEntityAtRandomPosition(player);
    // add enemies
    this.addEntityAtRandomPosition(new Entity(Entities.Enemy));
  }

  // Standard getters
  getWidth() {
    return this._width;
  }
  getHeight() {
    return this._height;
  }
  getEngine() {
    return this._engine;
  }
  getEntities() {
    return this._entities;
  }

  getEntityAt(x, y) {
    // Returns entity if there is an entity at x,y
    for (let entity of this.entities) {
      if (entity.getX() === x && entity.getY() === y) {
        return entity;
      }
    }
    return false;
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

  isEmptyFloor(x, y) {
    // Check if the tile is floor and also has no entity
    return this.getTile(x, y) === Tile.floorTile && !this.getEntityAt(x, y);
  }

  getRandomFloorPosition() {
    // Randomly generate a tile which is a floor
    let x, y;
    do {
      x = Math.floor(Math.random() * this._width);
      y = Math.floor(Math.random() * this._width);
    } while (!this.isEmptyFloor(x, y));
    return { x: x, y: y };
  }

  // dig function if implemented later
  dig(x, y) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y).isDiggable()) {
      this._tiles[x][y] = Game.Tile.floorTile;
    }
  }

  getEntitiesWithinRadius(centerX, centerY, radius) {
    let results = [];
    // Determine our bounds
    let leftX = centerX - radius;
    let rightX = centerX + radius;
    let topY = centerY - radius;
    let bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    for (let i = 0; i < this._entities.length; i++) {
      if (
        this._entities[i].getX() >= leftX &&
        this._entities[i].getX() <= rightX &&
        this._entities[i].getY() >= topY &&
        this._entities[i].getY() <= bottomY
      ) {
        results.push(this._entities[i]);
      }
    }
    return results;
  }

  addEntity(entity) {
    // Make sure the entity's position is within bounds
    if (
      entity.getX() < 0 ||
      entity.getX() >= this._width ||
      entity.getY() < 0 ||
      entity.getY() >= this._height
    ) {
      throw new Error('Adding entity out of bounds.');
    }
    // Update the entity's map
    entity.setMap(this);
    // Add the entity to the list of entities
    this._entities.push(entity);
    // Check if this entity is an actor, and if so add them to the scheduler
    if (entity.hasMixin('Actor')) {
      this._scheduler.add(entity, true);
    }
  }

  addEntityAtRandomPosition(entity) {
    let position = this.getRandomFloorPosition();
    entity.setX(position.x);
    entity.setY(position.y);
    this.addEntity(entity);
  }

  removeEntity(entity) {
    // Find the entity in the list of entities if it is present
    for (let i = 0; i < this._entities.length; i++) {
      if (this._entities[i] === entity) {
        this._entities.splice(i, 1);
        break;
      }
    }
    // If the entity is an actor, remove them from the scheduler
    if (entity.hasMixin('Actor')) {
      this._scheduler.remove(entity);
    }
    // todo: redraw entity/tile
  }

  // /**
  //  * This function generates a map and stores free cells in an array
  //  * by using a map generation algorithm fron ROT
  //  */
  // generateMap() {
  //   let map = [];
  //   for (let x = 0; x < ROT.DEFAULT_WIDTH; x++) {
  //     // Create the nested array for the y values
  //     map.push([]);
  //     // Add all the tiles
  //     for (let y = 0; y < ROT.DEFAULT_HEIGHT; y++) {
  //       map[x].push(Tile.nullTile);
  //     }
  //   }

  //   // generate map type
  //   let arena = new ROT.Map.Arena();

  //   // create map
  //   let mapCallback = (x, y, wall) => {
  //     if (!wall) {
  //       // stores empty coordinates
  //       // add freeCells to map
  //       this.freeCells.push([x, y]);
  //       map[x][y] = Tile.floorTile;
  //     } else {
  //       map[x][y] = Tile.wallTile;
  //     }
  //   };
  //   arena.create(mapCallback);

  //   return map;
  // }
  // // Function responsible for drawing map on display
  // renderMap(display) {
  //   // Iterate through all map cells
  //   for (let x = 0; x < Game._map.getWidth(); x++) {
  //     for (let y = 0; y < Game._map.getHeight(); y++) {
  //       // Fetch the glyph for the tile and render it to the screen
  //       let tile = Game._map.getTile(x, y);
  //       display.draw(
  //         x,
  //         y,
  //         tile.getChar(),
  //         tile.getForeground(),
  //         tile.getBackground()
  //       );
  //     }
  //   }
  // }

  // Function responsible for creating actors on free cells
  // renderEntities() {
  //   // call function to display entity on a free cell
  //   Game.player = createEntity(this.freeCells, Entity, Entities.Player);
  //   Game.enemy = createEntity(this.freeCells, Entity, Entities.Enemy);
  //   Game.enemy1 = createEntity(this.freeCells, Entity, Entities.Enemy);
  // }
}
