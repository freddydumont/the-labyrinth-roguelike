import { vsprintf } from 'sprintf-js';
import { ROT, Game } from './game';
import Entity from './entity';
import Tile from './tile';
import Entities from './entities';

export class Map {
  constructor(tiles, player) {
    this._tiles = tiles;
    // cache dimensions
    this._depth = this._tiles.length;
    this._width = this._tiles[0].length;
    this._height = this._tiles[0][0].length;
    // setup the FOV
    this._fov = [];
    this.setupFov();
    // create a list which will hold the entities
    this._entities = [];
    // create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);
    // add the player
    this.addEntityAtRandomPosition(player, 0);
    // add enemies
    this.addEntityAtRandomPosition(new Entity(Entities.Enemy), 0);
    // setup the explored array
    this._explored = new Array(this._depth);
    this._setupExploredArray();
  }

  // Standard getters
  getWidth() {
    return this._width;
  }
  getHeight() {
    return this._height;
  }
  getDepth() {
    return this._depth;
  }
  getEngine() {
    return this._engine;
  }
  getEntities() {
    return this._entities;
  }
  getFov(depth) {
    return this._fov[depth];
  }

  getEntityAt(x, y, z) {
    // Iterate through all entities searching for one with matching position
    for (let entity of this._entities) {
      if (entity.getX() === x && entity.getY() === y && entity.getZ() === z) {
        return entity;
      }
    }
    return false;
  }

  // Gets the tile for a given coordinate set
  getTile(x, y, z) {
    // Make sure we are inside the bounds. If we aren't, return a null tile.
    if (
      x < 0 ||
      x >= this._width ||
      y < 0 ||
      y >= this._height ||
      z < 0 ||
      z >= this._depth
    ) {
      return Tile.nullTile;
    } else {
      return this._tiles[z][x][y] || Tile.nullTile;
    }
  }

  isEmptyFloor(x, y, z) {
    // Check if the tile is floor and also has no entity
    return (
      this.getTile(x, y, z) === Tile.floorTile && !this.getEntityAt(x, y, z)
    );
  }

  getRandomFloorPosition(z) {
    // Randomly generate a tile which is a floor
    let x, y;
    do {
      x = Math.floor(Math.random() * this._width);
      y = Math.floor(Math.random() * this._width);
    } while (!this.isEmptyFloor(x, y, z));
    return { x: x, y: y, z: z };
  }

  // dig function if implemented later
  dig(x, y, z) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y, z).isDiggable()) {
      this._tiles[z][x][y] = Tile.floorTile;
    }
  }

  getEntitiesWithinRadius(centerX, centerY, centerZ, radius) {
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
        this._entities[i].getY() <= bottomY &&
        this._entities[i].getZ() === centerZ
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
      entity.getY() >= this._height ||
      entity.getZ() < 0 ||
      entity.getZ() >= this._depth
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

  addEntityAtRandomPosition(entity, z) {
    let position = this.getRandomFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
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
  }

  /**
   * Setup each level's field of vision
   */
  setupFov() {
    /**
     * Function to call in the loop below.
     * Creates a callback to figure out if light can pass through
     */
    const fillFov = z => {
      this._fov.push(
        new ROT.FOV.DiscreteShadowcasting(
          (x, y) => {
            return !this.getTile(x, y, z).isBlockingLight();
          },
          { topology: 4 }
        )
      );
    };

    // Iterate through each depth level, setting up the field of vision
    for (let z = 0; z < this._depth; z++) {
      fillFov(z);
    }
  }

  /**
   * In order to keep track of what has been explored,
   * we have a 3D array of booleans representing the world.
   * If a given coordinate is set to true, then it has appeared in the player's
   * field of vision before and is therefore considered to be 'explored'.
   */
  _setupExploredArray() {
    for (let z = 0; z < this._depth; z++) {
      this._explored[z] = new Array(this._width);
      for (let x = 0; x < this._width; x++) {
        this._explored[z][x] = new Array(this._height);
        for (let y = 0; y < this._height; y++) {
          this._explored[z][x][y] = false;
        }
      }
    }
  }

  setExplored(x, y, z, state) {
    // Only update if the tile is within bounds
    if (this.getTile(x, y, z) !== Tile.nullTile) {
      this._explored[z][x][y] = state;
    }
  }

  isExplored(x, y, z) {
    // Only return the value if within bounds
    if (this.getTile(x, y, z) !== Tile.nullTile) {
      return this._explored[z][x][y];
    } else {
      return false;
    }
  }
}

/**
 * Renders map and entities on display. Accounts for a map larger than screen.
 */
export const renderMap = function(display) {
  const screenWidth = Game.getScreenWidth();
  const screenHeight = Game.getScreenHeight();
  // Make sure the x-axis doesn't go to the left of the left bound
  let topLeftX = Math.max(0, this._player.getX() - screenWidth / 2);
  // Make sure we still have enough space to fit an entire game screen
  topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
  // Make sure the y-axis doesn't above the top bound
  let topLeftY = Math.max(0, this._player.getY() - screenHeight / 2);
  // Make sure we still have enough space to fit an entire game screen
  topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
  // This object keeps track of all visible map cells
  let visibleCells = {};
  // Find all visible cells and update the object
  this._map
    .getFov(this._player.getZ())
    .compute(
      this._player.getX(),
      this._player.getY(),
      this._player.getSightRadius(),
      function(x, y, radius, visibility) {
        visibleCells[x + ',' + y] = true;
      }
    );
  // Iterate through all visible map cells
  for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
    for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
      if (visibleCells[x + ',' + y]) {
        // Fetch the glyph for the tile and render it to the screen at the offset position.
        let tile = this._map.getTile(x, y, this._player.getZ());
        display.draw(
          x - topLeftX,
          y - topLeftY,
          tile.getChar(),
          tile.getForeground(),
          tile.getBackground()
        );
      }
    }
  }
  // Render the entities
  let entities = this._map.getEntities();
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i];
    // Only render the entity if they would show up on the screen
    if (
      entity.getX() >= topLeftX &&
      entity.getY() >= topLeftY &&
      entity.getX() < topLeftX + screenWidth &&
      entity.getY() < topLeftY + screenHeight &&
      entity.getZ() === this._player.getZ()
    ) {
      if (visibleCells[entity.getX() + ',' + entity.getY()]) {
        display.draw(
          entity.getX() - topLeftX,
          entity.getY() - topLeftY,
          entity.getChar(),
          entity.getForeground(),
          entity.getBackground()
        );
      }
    }
  }
  // Render player HP
  let stats = '%c{white}%b{black}';
  stats += vsprintf('HP: %d/%d ', [
    this._player.getHp(),
    this._player.getMaxHp()
  ]);
  display.drawText(0, screenHeight, stats);
};
