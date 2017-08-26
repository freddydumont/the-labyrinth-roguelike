import { vsprintf } from 'sprintf-js';
import { ROT, Game } from './game';
import Tile from './tile';
import { EntityRepository } from './entities';
import { ItemRepository } from './items';

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
    // store our entities in a hash table indexed by position [x,y,z]
    this._entities = {};
    // Create a table which will hold the items
    this._items = {};
    // create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);
    // add the player
    this.addEntityAtRandomPosition(player, 0);
    // Add random enemies to each floor.
    for (let z = 0; z < this._depth; z++) {
      // 15 entities per floor
      for (let i = 0; i < 15; i++) {
        // Add a random entity
        this.addEntityAtRandomPosition(EntityRepository.createRandom(), z);
      }
      // 10 items per floor
      for (let i = 0; i < 10; i++) {
        // Add a random entity
        this.addItemAtRandomPosition(ItemRepository.createRandom(), z);
      }
    }
    // Add weapons and armor to the map in random positions
    const templates = [
      'dagger',
      'sword',
      'staff',
      'tunic',
      'chainmail',
      'platemail'
    ];
    for (let i = 0; i < templates.length; i++) {
      this.addItemAtRandomPosition(
        ItemRepository.create(templates[i]),
        Math.floor(this._depth * Math.random())
      );
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

  /***********
   * ITEMS
   ***********/

  getItemsAt(x, y, z) {
    return this._items[x + ',' + y + ',' + z];
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
 * TODO: move function to a more appropriate place (inline in playScreen?)
 */
export const renderMap = function(display) {
  const screenWidth = Game.getScreenWidth();
  const screenHeight = Game.getScreenHeight();
  const player = this._player;
  const map = this._map;
  // Make sure the x-axis doesn't go to the left of the left bound
  let topLeftX = Math.max(0, player.getX() - screenWidth / 2);
  // Make sure we still have enough space to fit an entire game screen
  topLeftX = Math.min(topLeftX, map.getWidth() - screenWidth);
  // Make sure the y-axis doesn't above the top bound
  let topLeftY = Math.max(0, player.getY() - screenHeight / 2);
  // Make sure we still have enough space to fit an entire game screen
  topLeftY = Math.min(topLeftY, map.getHeight() - screenHeight);

  // This object keeps track of all visible map cells
  let visibleCells = {};
  let currentDepth = player.getZ();
  // Find all visible cells and update the object
  map
    .getFov(currentDepth)
    .compute(
      player.getX(),
      player.getY(),
      player.getSightRadius(),
      (x, y, radius, visibility) => {
        visibleCells[x + ',' + y] = true;
        // Mark cell as explored
        map.setExplored(x, y, currentDepth, true);
      }
    );

  // Iterate through all visible map cells
  for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
    for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
      if (visibleCells[x + ',' + y]) {
        // Fetch the glyph for the tile and render it to the screen at the offset position.
        let tile = map.getTile(x, y, player.getZ());
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

  // Render the explored map cells
  for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
    for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
      if (map.isExplored(x, y, currentDepth)) {
        // Fetch the glyph for the tile and render it to the screen
        // at the offset position.
        let glyph = map.getTile(x, y, currentDepth);
        let foreground = glyph.getForeground();
        // If we are at a cell that is in the field of vision, we need
        // to check if there are items or entities.
        if (visibleCells[x + ',' + y]) {
          // Check for items first, since we want to draw entities over items.
          const items = map.getItemsAt(x, y, currentDepth);
          // If we have items, we want to render the top most item
          if (items) {
            glyph = items[items.length - 1];
          }
          // Check if we have an entity at the position
          if (map.getEntityAt(x, y, currentDepth)) {
            glyph = map.getEntityAt(x, y, currentDepth);
          }
          // Update the foreground color in case our glyph changed
          foreground = glyph.getForeground();
        } else {
          // Since the tile was previously explored but is not visible,
          // we want to change the foreground color to dark gray.
          foreground = 'darkgray';
        }
        display.draw(
          x - topLeftX,
          y - topLeftY,
          glyph.getChar(),
          foreground,
          glyph.getBackground()
        );
      }
    }
  }

  // Render the entities
  let entities = map.getEntities();
  for (const key in entities) {
    const entity = entities[key];
    // Only render the entity if they would show up on the screen
    if (
      entity.getX() >= topLeftX &&
      entity.getY() >= topLeftY &&
      entity.getX() < topLeftX + screenWidth &&
      entity.getY() < topLeftY + screenHeight &&
      entity.getZ() === player.getZ()
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
  stats += vsprintf('HP: %d/%d ', [player.getHp(), player.getMaxHp()]);
  display.drawText(0, screenHeight, stats);
};
