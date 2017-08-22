import { ROT, Game } from './game';
import * as Messages from './messages';

const Mixins = {
  /**
   * Adds an internal array of messages and provide a method for receiving a message,
   * as well methods for fetching and clearing the messages.
   */
  MessageRecipient: {
    name: 'MessageRecipient',
    init: function(props) {
      this._messages = [];
    },
    receiveMessage: function(message) {
      this._messages.push(message);
    },
    getMessages: function() {
      return this._messages;
    },
    clearMessages: function() {
      this._messages = [];
    }
  },

  // This mixin signifies an entity can take damage and be destroyed
  Destructible: {
    name: 'Destructible',
    init: function(props) {
      this._maxHp = props['maxHp'] || 10;
      // We allow taking in health from the props incase we want
      // the entity to start with a different amount of HP than the
      // max specified.
      this._hp = props['hp'] || this._maxHp;
      this._defenseValue = props['defenseValue'] || 0;
    },
    getDefenseValue: function() {
      return this._defenseValue;
    },
    getHp: function() {
      return this._hp;
    },
    getMaxHp: function() {
      return this._maxHp;
    },
    takeDamage: function(attacker, damage) {
      this._hp -= damage;
      // If have 0 or less HP, then remove ourseles from the map
      if (this._hp <= 0) {
        Messages.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
        Messages.sendMessage(this, 'You die!');
        this.getMap().removeEntity(this);
      }
    }
  },

  // This signifies our entity can attack basic destructible enities
  Attacker: {
    name: 'Attacker',
    groupName: 'Attacker',
    init: function(props) {
      this._attackValue = props['attackValue'] || 1;
    },
    getAttackValue: function() {
      return this._attackValue;
    },
    attack: function(target) {
      // If the target is destructible, calculate the damage
      // based on attack and defense value
      if (target.hasMixin('Destructible')) {
        let attack = this.getAttackValue();
        let defense = target.getDefenseValue();
        let max = Math.max(0, attack - defense);
        let damage = 1 + Math.floor(Math.random() * max);

        Messages.sendMessage(this, 'You strike the %s for %d damage!', [
          target.getName(),
          damage
        ]);
        Messages.sendMessage(target, 'The %s strikes you for %d damage!', [
          this.getName(),
          damage
        ]);

        target.takeDamage(this, damage);
      }
    }
  },

  Moveable: {
    name: 'Moveable',
    tryMove: function(x, y, map) {
      // returns true if walkable else false
      let tile = map.getTile(x, y);
      // returns being if there is one else false
      let target = map.getEntityAt(x, y);
      // If an entity was present at the tile
      if (target) {
        // If we are an attacker, try to attack the target
        if (this.hasMixin('Attacker')) {
          this.attack(target);
          return true;
        } else {
          // If not nothing we can do, but we can't move to the tile
          return false;
        }
        // Check if we can walk on the tile and if so simply walk onto it
      } else if (tile.isWalkable()) {
        // Update the entity's position
        this._x = x;
        this._y = y;
        return true;
      }
      return false;
    }
  },

  // Player Specific Mixins
  PlayerActor: {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
      // Re-render the screen
      Game.refresh();
      // Lock the engine and wait asynchronously
      // for the player to press a key.
      this.getMap().getEngine().lock();
      // // Clear the message queue
      // this.clearMessages();
    }
  },

  // Enemy Specific Mixins
  EnemyActor: {
    name: 'EnemyActor',
    groupName: 'Actor',
    act: function() {
      // get player coodinates
      let x = Game.player.getX();
      let y = Game.player.getY();

      // passableCallback tells the pathfinder which tiles are passable
      const passableCallback = function(x, y) {
        return Game._map.getTile(x, y).isWalkable();
      };

      const newPosition = function(newX, newY) {
        // draws new position and deletes old
        // redraw old position
        let oldKey = Game._map.getTile(this._x, this._y);
        Game._display.draw(
          this._x,
          this._y,
          oldKey.getChar(),
          oldKey.getForeground(),
          oldKey.getBackground()
        );

        // redraw new position
        this._x = newX;
        this._y = newY;
        this.draw();
      };

      // patchfinding algorithm -- topology makes the enemy move in 4 directions only
      const astar = new ROT.Path.AStar(x, y, passableCallback, { topology: 4 });

      // compute finds the shortest path and pushes it to path
      let path = [];
      const pathCallback = function(x, y) {
        path.push([x, y]);
      };
      astar.compute(this._x, this._y, pathCallback);

      // remove enemy position
      path.shift();
      if (path.length <= 1) {
        // enemy and player and next to each other
        console.log('collision imminent');
      } else {
        // get first coordinates of the path
        x = path[0][0];
        y = path[0][1];

        // Checks if tile is walkable
        if (this.tryMove(x, y, Game._map)) {
          newPosition(x, y);
        }
      }
    }
  }
};

export default Mixins;
