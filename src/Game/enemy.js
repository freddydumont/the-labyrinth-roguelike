import { ROT, Game } from './game';
import Entity from './entity';

export default class Enemy extends Entity {
  // TODO: Add field of view
  act() {
    // get player coodinates
    let x = Game.player.getX();
    let y = Game.player.getY();

    // passableCallback tells the pathfinder what areas are passable
    // TODO: update with Game.passableCells when available
    const passableCallback = function(x, y) {
      return x + ',' + y in Game._map;
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

    if (path.length === 1) {
      // enemy and player and next to each other
      // Game.engine.lock();
      console.log('collision imminent');
    } else {
      // get first coordinates of the path
      x = path[0][0];
      y = path[0][1];

      // redraw old position
      Game.display.draw(this._x, this._y, Game._map[this._x + ',' + this._y]);

      // draw enemy at new position
      this._x = x;
      this._y = y;
      this.draw();
    }
  }
}
