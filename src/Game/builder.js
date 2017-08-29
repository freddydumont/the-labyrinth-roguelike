import { ROT } from './game';
import Tile, { getNeighborPositions } from './tile';
/**
 * Builder is responsible for all map generation, thus all the tiles for a world.
 * We can then use these tiles to create a Map object.
 * 
 * When we generate a map, we are going to have two key variables.
 * The first is a 3D array representing the tile at each cell in the world.
 * The second is a 3D array assigning a region number to each cell in a world.
 * For both arrays, the depth is the first dimension rather than the 3rd one
 * as this allows us to manipulate an entire depth layer at once.
 * 
 * We split each individual Z level into a bunch of regions.
 * A region is essentialy a grouping of tiles such that any tile in the region
 * can reach all other tiles in the region without having to dig.
 * 
 * Every non-walkable tile has a region value of 0.
 * All walkable tiles have a region value starting at 1 designating which region they belong to.
 */
export default class Builder {
  constructor(width, height, depth) {
    this._width = width;
    this._height = height;
    this._depth = depth;
    this._tiles = new Array(depth);
    this._regions = new Array(depth);

    // Instantiate the arrays to be multi-dimension
    for (let z = 0; z < depth; z++) {
      // Create a new dungeon at each level
      if (z === depth - 1) {
        // if last level, generate a maze
        this._tiles[z] = this._generateLevel(
          ROT.Map.EllerMaze,
          Tile.mazeWallTile
        );
      } else {
        this._tiles[z] = this._generateLevel();
      }
      // Setup the regions array for each depth
      this._regions[z] = new Array(width);
      for (let x = 0; x < width; x++) {
        this._regions[z][x] = new Array(height);
        // Fill with zeroes
        for (let y = 0; y < height; y++) {
          this._regions[z][x][y] = 0;
        }
      }
    }

    // Setup and connect regions with stairs
    for (var z = 0; z < this._depth; z++) {
      this._setupRegions(z);
    }
    this._connectAllRegions();
  }

  // Getters
  getTiles() {
    return this._tiles;
  }
  getDepth() {
    return this._depth;
  }
  getWidth() {
    return this._width;
  }
  getHeight() {
    return this._height;
  }

  /**
   * Level generator.
   * See https://ondras.github.io/rot.js/manual/#map/dungeon
   * for more info on dungeon generators, including rooms and corridors.
   */
  _generateLevel(MapAlgorithm = ROT.Map.Digger, wallTile = Tile.wallTile) {
    let map = [];
    for (let x = 0; x < this._width; x++) {
      // Create the nested array for the y values
      map.push([]);
      // Add all the tiles
      for (let y = 0; y < this._height; y++) {
        map[x].push(Tile.nullTile);
      }
    }

    // generate map type
    let generator = new MapAlgorithm(this._width, this._height);

    // create map
    generator.create((x, y, wall) => {
      if (!wall) {
        map[x][y] = Tile.floorTile;
      } else {
        map[x][y] = wallTile;
      }
    });

    return map;
  }

  _canFillRegion(x, y, z) {
    // Make sure the tile is within bounds
    if (
      x < 0 ||
      y < 0 ||
      z < 0 ||
      x >= this._width ||
      y >= this._height ||
      z >= this._depth
    ) {
      return false;
    }
    // Make sure the tile does not already have a region
    if (this._regions[z][x][y] !== 0) {
      return false;
    }
    // Make sure the tile is walkable
    return this._tiles[z][x][y].isWalkable();
  }

  /**
   * Accepts a starting tile and a region number and spread out from there,
   * changing the region of all tiles which should belong in the same region.
   * Return the number of tiles affected.
   */
  _fillRegion(region, x, y, z) {
    let tilesFilled = 1;
    let tiles = [{ x: x, y: y }];
    let tile;
    let neighbors;
    // Update the region of the original tile
    this._regions[z][x][y] = region;
    // Keep looping while we still have tiles to process
    while (tiles.length > 0) {
      tile = tiles.pop();
      // Get the neighbors of the tile
      neighbors = getNeighborPositions(tile.x, tile.y);
      // Iterate through each neighbor, checking if we can use it to fill
      // and if so updating the region and adding it to our processing list.
      while (neighbors.length > 0) {
        tile = neighbors.pop();
        if (this._canFillRegion(tile.x, tile.y, z)) {
          this._regions[z][tile.x][tile.y] = region;
          tiles.push(tile);
          tilesFilled++;
        }
      }
    }
    return tilesFilled;
  }

  /**
   * This removes all tiles at a given depth level with a region number.
   * It fills the tiles with a wall tile.
   */
  _removeRegion(region, z) {
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        if (this._regions[z][x][y] === region) {
          // Clear the region and set the tile to a wall tile
          this._regions[z][x][y] = 0;
          this._tiles[z][x][y] = Tile.wallTile;
        }
      }
    }
  }

  /**
   * This sets up the regions for a given depth level.
   */
  _setupRegions(z) {
    let region = 1;
    let tilesFilled;
    // Iterate through all tiles searching for a tile that
    // can be used as the starting point for a flood fill
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        if (this._canFillRegion(x, y, z)) {
          // Try to fill
          tilesFilled = this._fillRegion(region, x, y, z);
          // If it was too small, simply remove it
          if (tilesFilled <= 20) {
            this._removeRegion(region, z);
          } else {
            region++;
          }
        }
      }
    }
  }

  /**
   * This fetches a list of points that overlap between one region
   * at a given depth level and a region at a level beneath it.
   */
  _findRegionOverlaps(z, r1, r2) {
    let matches = [];
    // Iterate through all tiles, checking if they respect
    // the region constraints and are floor tiles. We check
    // that they are floor to make sure we don't try to
    // put two stairs on the same tile.
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        if (
          this._tiles[z][x][y] === Tile.floorTile &&
          this._tiles[z + 1][x][y] === Tile.floorTile &&
          this._regions[z][x][y] === r1 &&
          this._regions[z + 1][x][y] === r2
        ) {
          matches.push({ x: x, y: y });
        }
      }
    }
    // shuffle the list of matches to prevent bias
    return matches.randomize();
  }

  /**
   * This tries to connect two regions by calculating
   * where they overlap and adding stairs
   */
  _connectRegions(z, r1, r2) {
    const overlap = this._findRegionOverlaps(z, r1, r2);
    // Make sure there was overlap
    if (overlap.length === 0) {
      return false;
    }
    // Select the first tile from the overlap and change it to stairs
    const point = overlap[0];
    this._tiles[z][point.x][point.y] = Tile.stairsDownTile;
    this._tiles[z + 1][point.x][point.y] = Tile.stairsUpTile;
    return true;
  }

  /**
   * This tries to connect all regions for each depth level,
   * starting from the top most depth level.
   */
  _connectAllRegions() {
    for (let z = 0; z < this._depth - 1; z++) {
      // Iterate through each tile, and if we haven't tried to connect
      // the region of that tile on both depth levels then we try.
      // We store connected properties as strings for quick lookups.
      let connected = {};
      let key;
      for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
          key = this._regions[z][x][y] + ',' + this._regions[z + 1][x][y];
          if (
            this._tiles[z][x][y] === Tile.floorTile &&
            this._tiles[z + 1][x][y] === Tile.floorTile &&
            !connected[key]
          ) {
            // Since both tiles are floors and we haven't
            // already connected the two regions, try now.
            this._connectRegions(
              z,
              this._regions[z][x][y],
              this._regions[z + 1][x][y]
            );
            connected[key] = true;
          }
        }
      }
    }
  }
}
