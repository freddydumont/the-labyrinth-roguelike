import DynamicGlyph from './dynamicglyph';
import Tile from './tile';
import EntityMixins from './entitymixins';
import * as Messages from './messages';

/**
 * A basic entity is composed of a glyph as well as a position and a name (used in messages).
 * An entity can be anything. Ex. Player, enemy, items, etc
 */
export default class Entity extends DynamicGlyph {
  constructor(props) {
    super(props);
    // Instantiate any properties from the passed object
    this._x = props['x'] || 0;
    this._y = props['y'] || 0;
    this._z = props['z'] || 0;
    this._map = null;
    this._alive = true;
  }
  kill(message) {
    // Only kill once!
    if (!this._alive) {
      return;
    }
    this._alive = false;
    if (message) {
      Messages.sendMessage(this, message);
    } else {
      Messages.sendMessage(this, 'You have died!');
    }

    // Check if the player died, and if so call their act method to prompt the user.
    if (this.hasMixin(EntityMixins.PlayerActor)) {
      this.act();
    } else {
      this.getMap().removeEntity(this);
    }
  }
  setPosition(x, y, z) {
    // keep old position in memory
    const oldX = this._x;
    const oldY = this._y;
    const oldZ = this._z;
    // Update position
    this._x = x;
    this._y = y;
    this._z = z;
    // If the entity is on a map, notify the map that the entity has moved.
    if (this._map) {
      this._map.updateEntityPosition(this, oldX, oldY, oldZ);
    }
  }

  tryMove(x, y, z, map = this.getMap()) {
    // returns true if walkable else false
    let tile = map.getTile(x, y, this.getZ());
    // returns being if there is one else false
    let target = map.getEntityAt(x, y, this.getZ());
    // If our z level changed, check if we are on stair
    if (z < this.getZ()) {
      if (tile !== Tile.stairsUpTile) {
        Messages.sendMessage(this, "You can't go up here!");
      } else {
        Messages.sendMessage(this, 'You ascend to level %d!', [z + 1]);
        this.setPosition(x, y, z);
      }
    } else if (z > this.getZ()) {
      if (tile !== Tile.stairsDownTile) {
        Messages.sendMessage(this, "You can't go down here!");
      } else {
        this.setPosition(x, y, z);
        Messages.sendMessage(this, 'You descend to level %d!', [z + 1]);
      }
      // If an entity was present at the tile
    } else if (target) {
      // An entity can only attack if the entity has the Attacker mixin and
      // either the entity or the target is the player.
      if (
        this.hasMixin('Attacker') &&
        (this.hasMixin(EntityMixins.PlayerActor) ||
          target.hasMixin(EntityMixins.PlayerActor))
      ) {
        this.attack(target);
        return true;
      }
      // If not nothing we can do, but we can't move to the tile
      return false;
      // Check if we can walk on the tile and if so simply walk onto it
    } else if (tile.isWalkable()) {
      // Update the entity's position
      this.setPosition(x, y, z);
      // Notify the entity if there are items at this position
      const items = this.getMap().getItemsAt(x, y, z);
      if (items) {
        if (items.length === 1) {
          Messages.sendMessage(this, 'You see %s.', [items[0].describeA()]);
        } else {
          Messages.sendMessage(this, 'There are several objects here.');
        }
      }
      return true;
      // Check if the tile is diggable
    } else if (tile.isDiggable()) {
      // Only dig if the the entity is the player
      if (this.hasMixin(EntityMixins.PlayerActor)) {
        map.dig(x, y, z);
        return true;
      }
      // If not nothing we can do, but we can't move to the tile
      return false;
    }
    return false;
  }

  // setters
  setX(x) {
    this._x = x;
  }
  setY(y) {
    this._y = y;
  }
  setZ(z) {
    this._z = z;
  }
  setMap(map) {
    this._map = map;
  }

  // getters
  getX() {
    return this._x;
  }
  getY() {
    return this._y;
  }
  getZ() {
    return this._z;
  }
  getMap() {
    return this._map;
  }
  isAlive() {
    return this._alive;
  }
}
