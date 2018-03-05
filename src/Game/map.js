import { ROT } from './game';
import TileRepository from './Repositories/tileRepository';
import { EntityRepository } from './Repositories/entityRepository';
import { ItemRepository, GearRepository } from './Repositories/itemRepository';
import Geometry from './geometry';

export default class Map {
  constructor(tiles, player) {
    this._tiles = tiles;
    // cache dimensions
    this._depth = this._tiles.length;
    this._width = this._tiles[0].length;
    this._height = this._tiles[0][0].length;
    // setup the FOV
    this._fov = [];
    this.setupFov();
    // store our entities in a hash table indexed by position [x,y,z]
    this._entities = {};
    // Create a table which will hold the items
    this._items = {};
    // create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Speed();
    this._engine = new ROT.Engine(this._scheduler);
    // add the player
    this._player = player;
    this.addEntityAtRandomPosition(player, 0);

    // Add random enemies and items to each floor.
    // Except last one where we only add minotaur and youths.
    for (let z = 0; z < this._depth; z++) {
      if (z === this._depth - 1) {
        this.addEntityAtRandomPosition(EntityRepository.create('minotaur'), z);
        // 13 youths
        for (let i = 0; i < 13; i++) {
          this.addEntityAtRandomPosition(EntityRepository.create('youth'), z);
        }
      } else {
        // 15 entities per floor
        for (let i = 0; i < 15; i++) {
          // Add a random entity
          const entity = EntityRepository.createRandomOnLevel(z);
          this.addEntityAtRandomPosition(entity, z);
          // Level up the entity based on the floor
          if (entity.hasMixin('ExperienceGainer')) {
            for (let level = 0; level < z; level++) {
              entity.giveExperience(
                entity.getNextLevelExperience() - entity.getExperience()
              );
            }
          }
        }

        // 10 items per floor
        for (let i = 0; i < 10; i++) {
          // Add a random item
          this.addItemAtRandomPosition(ItemRepository.createRandom(), z);
        }

        // 2 weapons/armors per floor
        for (let i = 0; i < 2; i++) {
          this.addItemAtRandomPosition(
            GearRepository.createFromWeightedValues(z),
            z
          );
        }
      }
    }

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
  getPlayer() {
    return this._player;
  }

  /***********
   * ITEMS
   ***********/

  getItemsAt(x, y, z) {
    return this._items[x + ',' + y + ',' + z] || false;
  }

  setItemsAt(x, y, z, items) {
    // If our items array is empty, then delete the key from the table.
    const key = x + ',' + y + ',' + z;
    if (items.length === 0) {
      if (this._items[key]) {
        delete this._items[key];
      }
    } else {
      // Simply update the items at that key
      this._items[key] = items;
    }
  }

  removeItemAt(x, y, z, item) {
    const key = x + ',' + y + ',' + z;
    // if there is an item on the ground
    if (this._items[key]) {
      // if there is only one item, delete the key from the table
      if (this._items[key].length === 1) {
        delete this._items[key];
        // if there is more than one item, remove the corresponding item from the array
      } else {
        // find the index of the corresponding item
        const index = this._items[key].findIndex(element => {
          return element === item;
        });
        // remove it from the array
        this._items[key].splice(index, 1);
      }
    }
  }

  addItem(x, y, z, item) {
    // If we already have items at that position, simply append the item to the
    // list of items.
    const key = x + ',' + y + ',' + z;
    if (this._items[key]) {
      this._items[key].push(item);
    } else {
      this._items[key] = [item];
    }
  }

  addItemAtRandomPosition(item, z) {
    const position = this.getRandomFloorPosition(z);
    this.addItem(position.x, position.y, position.z, item);
  }

  /***********
   * ENTITIES
   ***********/

  getEntityAt(x, y, z) {
    // Get the entity based on position key
    return this._entities[x + ',' + y + ',' + z];
  }

  getEntitiesWithinRadius(centerX, centerY, centerZ, radius) {
    let results = [];
    // Determine our bounds
    let leftX = centerX - radius;
    let rightX = centerX + radius;
    let topY = centerY - radius;
    let bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    for (let key in this._entities) {
      let entity = this._entities[key];
      if (
        entity.getX() >= leftX &&
        entity.getX() <= rightX &&
        entity.getY() >= topY &&
        entity.getY() <= bottomY &&
        entity.getZ() === centerZ
      ) {
        results.push(entity);
      }
    }
    return results;
  }

  getEntityClosestTo(x, y, z, isEntity) {
    // get the array of entities on the level
    const entities = this.getEntitiesWithinRadius(x, y, z, 100);
    // calculate distance from center on each entity, saving index for later
    let entitiesByDistance = entities.map((entity, i) => {
      return {
        index: i,
        distance: Geometry.getDistance(x, y, entity.getX(), entity.getY()),
      };
    });
    // sort the array to get the closest entity first
    entitiesByDistance.sort((a, b) => {
      return a.distance - b.distance;
    });
    // if we searched from an entity, we skip the first index
    // as we don't want to return the original entity
    return entities[entitiesByDistance[isEntity ? 1 : 0].index];
  }

  addEntityAtRandomPosition(entity, z) {
    let position = this.getRandomFloorPosition(z);
    entity.setX(position.x);
    entity.setY(position.y);
    entity.setZ(position.z);
    this.addEntity(entity);
  }

  updateEntityPosition(entity, oldX, oldY, oldZ) {
    // Delete the old key if it is the same entity and we have old positions.
    if (typeof oldX === 'number') {
      const oldKey = oldX + ',' + oldY + ',' + oldZ;
      if (this._entities[oldKey] === entity) {
        delete this._entities[oldKey];
      }
    }
    // Make sure the entity's position is within bounds
    if (
      entity.getX() < 0 ||
      entity.getX() >= this._width ||
      entity.getY() < 0 ||
      entity.getY() >= this._height ||
      entity.getZ() < 0 ||
      entity.getZ() >= this._depth
    ) {
      throw new Error("Entity's position is out of bounds.");
    }
    // Sanity check to make sure there is no entity at the new position.
    const key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
    if (this._entities[key]) {
      throw new Error('Tried to add an entity at an occupied position.');
    }
    // Add the entity to the table of entities
    this._entities[key] = entity;
  }

  addEntity(entity) {
    // Update the entity's map
    entity.setMap(this);
    // Update the map with the entity's position
    this.updateEntityPosition(entity);
    // Add to scheduler if entity is an Actor
    if (entity.hasMixin('Actor')) {
      this._scheduler.add(entity, true);
    }
  }

  removeEntity(entity) {
    // Remove the entity from the map
    const key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
    if (this._entities[key] === entity) {
      delete this._entities[key];
    }
    // If the entity is an actor, remove them from the scheduler
    if (entity.hasMixin('Actor')) {
      this._scheduler.remove(entity);
    }
  }

  /**************
   * TILE RELATED
   **************/

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
      return TileRepository.create('null');
    } else {
      return this._tiles[z][x][y] || TileRepository.create('null');
    }
  }

  isEmptyFloor(x, y, z) {
    // Check if the tile is floor and also has no entity
    return (
      this.getTile(x, y, z).describe() === 'floor' && !this.getEntityAt(x, y, z)
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
      this._tiles[z][x][y] = TileRepository.create('floor');
    }
  }

  /***********
   * FOV
   ***********/

  // setup each level's field of vision
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
    if (this.getTile(x, y, z).describe() !== 'null') {
      this._explored[z][x][y] = state;
    }
  }

  isExplored(x, y, z) {
    // Only return the value if within bounds
    if (this.getTile(x, y, z).describe() !== 'null') {
      return this._explored[z][x][y];
    } else {
      return false;
    }
  }
}
