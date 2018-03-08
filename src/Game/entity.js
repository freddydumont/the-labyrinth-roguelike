import { ROT } from './game';
import DynamicGlyph from './dynamicglyph';
import EntityMixins from './entitymixins';
import * as Messages from './messages';
import Geometry from './geometry';

// A basic entity is composed of a glyph as well as a position and a name (used in messages).
export default class Entity extends DynamicGlyph {
  constructor(props) {
    super(props);
    // Instantiate any properties from the passed object
    this._x = props['x'] || 0;
    this._y = props['y'] || 0;
    this._z = props['z'] || 0;
    this._foodValue = props['foodValue'] || 25;
    this._map = null;
    this._alive = true;
    // Acting speed
    this._speed = props['speed'] || 1000;
    // Level range
    this._levelRange = props['levelRange'] || 0;
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

  exchangePositionWith(entity) {
    // remove entity from map
    this._map.removeEntity(entity);
    // keep old position in memory
    const oldX = this._x;
    const oldY = this._y;
    const oldZ = this._z;
    // Update to entity position
    this._x = entity.getX();
    this._y = entity.getY();
    this._z = entity.getZ();
    this._map.updateEntityPosition(this, oldX, oldY, oldZ);
    // update entity position
    entity.setX(oldX);
    entity.setY(oldY);
    entity.setZ(oldZ);
    // add it to map
    this._map.addEntity(entity);
  }

  canDoAction(action, args) {
    if (action === 'ranged') {
      const { x, y, z } = args;
      // general checks for ranged actions
      return (
        this.hasMixin('Sight') &&
        this.canSee(x, y) &&
        this.getMap().getTile(x, y, z).isWalkable()
      );
    }
    return false;
  }

  tryMove(x, y, z, map = this.getMap()) {
    // returns true if walkable else false
    let tile = map.getTile(x, y, this.getZ());
    // returns being if there is one else false
    let target = map.getEntityAt(x, y, this.getZ());
    // If our z level changed, check if we are on stair
    if (z < this.getZ()) {
      if (tile.describe() !== 'stairsUp') {
        Messages.sendMessage(this, "You can't go up here!");
      } else {
        Messages.sendMessage(this, 'You ascend to level %d!', [z + 1]);
        this.setPosition(x, y, z);
      }
    } else if (z > this.getZ()) {
      if (tile.describe() !== 'stairsDown') {
        Messages.sendMessage(this, "You can't go down here!");
      } else {
        this.setPosition(x, y, z);
        Messages.sendMessage(this, 'You descend to level %d!', [z + 1]);
      }
      // If an entity was present at the tile
    } else if (target) {
      // if entity is sacrificed youth and this is player
      if (
        this.hasMixin(EntityMixins.PlayerActor) &&
        (target.getName() === 'sacrificed youth' ||
          target.getName() === 'sacrificed maiden')
      ) {
        this.exchangePositionWith(target);
        // get boss direction and opposite
        const boss = this.getMap().getBoss();
        const direction = Geometry.getCardinal(
          this.getX(),
          this.getY(),
          boss.getX(),
          boss.getY()
        );
        const opposite = Geometry.getCardinal(
          this.getX(),
          this.getY(),
          boss.getX(),
          boss.getY(),
          true
        );
        // create array of random messages with directions
        const messages = [
          `"I heard something coming from the ${direction}."`,
          `"He's after me! I'm gonna die!"`,
          `"I can hear it! Head ${direction} and kill the beast!"`,
          `"I am fleeing from the beast. Head ${opposite} if you want to live!"`,
          `"I don't want to die!"`,
        ];
        // Coin flip to send distress message to player
        if (Math.round(Math.random()) === 1) {
          Messages.sendMessage(
            this,
            messages[ROT.RNG.getUniformInt(0, messages.length - 1)],
            null,
            4
          );
        }
        return true;
      }
      // An entity can only attack if the entity has the Attacker mixin and
      // either the entity or the target is the player.
      // Special case for boss who will attack anything in his path
      if (
        this.hasMixin('Attacker') &&
        (this.hasMixin(EntityMixins.PlayerActor) ||
          this.hasMixin('BossActor') ||
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
      // Notify the entity if there are items or a staircase at this position
      // setup an empty message
      let message = '';
      // grab the items and staircase
      const items = this.getMap().getItemsAt(x, y, z);
      const staircase =
        tile.describe() === 'stairsUp'
          ? 'up'
          : tile.describe() === 'stairsDown' ? 'down' : false;

      // if there is a staircase, add to the message
      if (staircase) {
        message += `You see a staircase leading ${staircase}.`;
      }

      // if there is items, add to the message
      if (items) {
        // if the message is not empty, add a space
        if (message.length > 0) {
          message += ' ';
        }
        // add to the message depending on the amount of items
        if (items.length === 1) {
          message += `You see a ${items[0].describeA()}.`;
        } else {
          message += 'There are several objects here.';
        }
      }
      // if there is a message, send it
      if (message.length > 0) {
        Messages.sendMessage(this, message);
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
  setSpeed(speed) {
    this._speed = speed;
  }
  setLevelRange(range) {
    this._levelRange = range;
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
  getSpeed() {
    return this._speed;
  }
  getLevelRange() {
    return this._levelRange;
  }
  isAlive() {
    return this._alive;
  }
  getCorpseValue() {
    return this._foodValue;
  }
}
