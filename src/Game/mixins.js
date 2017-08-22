import { ROT, Game } from './game';

const Mixins = {
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
        // Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
        // Game.sendMessage(this, 'You die!');
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

        // Game.sendMessage(this, 'You strike the %s for %d damage!', [
        //   target.getName(),
        //   damage
        // ]);
        // Game.sendMessage(target, 'The %s strikes you for %d damage!', [
        //   this.getName(),
        //   damage
        // ]);

        target.takeDamage(this, damage);
      }
    }
  },

  // General Mixins
  newPosition: {
    name: 'newPosition',
    newPosition: function(newX, newY) {
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
    }
  },
  Moveable: {
    name: 'Moveable',
    tryMove: function(x, y) {
      // returns true if walkable else false
      let tile = Game._map.getTile(x, y);
      // returns being if there is one else false
      let entity = Game._map.getEntity(x, y);
      // Check if we can walk on the tile
      if (tile.isWalkable() && !entity) return true;
      // Fights entity at new position
      if (entity) {
        this.combat(entity);
      }
      return false;
    }
  },
  Combat: {
    name: 'Combat',
    combat: function(entity) {
      entity.health -= this.attack - entity.defence;
      // todo: entity color changed for .5s when taking damage
      if (entity.health <= 0) {
        // Remove scheduler, Remove entity
        entity.getMap().removeEntity(entity);
      }
      if (this.name !== 'player') {
        // have the enemy fight back
        this.health -= entity.attack - this.defence;
        if (this.health <= 0) {
          // todo: endgame
          // event listener for enter then switchscreen
          console.log('player died');
          window.removeEventListener('keydown', this);
          Game.engine.lock();
          return;
        }
      }
    }
  },
  // Player Specific Mixins
  PlayerAct: {
    name: 'PlayerAct',
    groupName: 'Actor',
    act: function() {
      Game.engine.lock();
      // wait for user input; do stuff when user hits a key
      window.addEventListener('keydown', this);
    }
  },
  EndTurn: {
    // ends entity turn
    name: 'EndTurn',
    endTurn: function() {
      // turn has ended, remove event listener and unlock engine
      window.removeEventListener('keydown', this);
      Game.engine.unlock();
    }
  },
  // Enemy Specific Mixins
  EnemyAct: {
    name: 'EnemyAct',
    groupName: 'Actor',
    act: function() {
      // get player coodinates
      let x = Game.player.getX();
      let y = Game.player.getY();

      // passableCallback tells the pathfinder which tiles are passable
      const passableCallback = function(x, y) {
        return Game._map.getTile(x, y).isWalkable();
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
        if (this.tryMove(x, y)) {
          this.newPosition(x, y);
        }
      }
    }
  },
  PlayerHandleEvent: {
    // handles movement event
    name: 'PlayerHandleEvent',
    handleEvent: function(e) {
      let keyMap = {};
      keyMap[38] = 0;
      keyMap[33] = 1;
      keyMap[39] = 2;
      keyMap[34] = 3;
      keyMap[40] = 4;
      keyMap[35] = 5;
      keyMap[37] = 6;
      keyMap[36] = 7;

      const code = e.keyCode;

      // If the key code is not present in keyMap, do nothing
      if (!(code in keyMap)) {
        return;
      }

      // If the key code is present, check whether the PC can move in that direction
      const dir = ROT.DIRS[8][keyMap[code]];
      const newX = this._x + dir[0];
      const newY = this._y + dir[1];

      // Checks if tile is walkable
      if (this.tryMove(newX, newY)) {
        this.newPosition(newX, newY);
        this.endTurn();
      }
    }
  }
};

export default Mixins;
