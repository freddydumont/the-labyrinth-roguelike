import { ROT, Game } from './game';

const Mixins = {
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
      // console.log('player:', this.getX(), this.getY());
      // console.log('enemy:', Game.enemy.getX(), Game.enemy.getY());
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
