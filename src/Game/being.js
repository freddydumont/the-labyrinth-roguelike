import { Game } from './game';
import Entity from './entity';

export default class Being extends Entity {
  constructor(props) {
    super(props);
    this.health = 3;
    this.def = 0;
    this.attack = 1;
  }
  newPosition(newX, newY) {
    // draws new position and deletes old
    // redraw old position
    let oldKey = Game._map.getTile(this._x, this._y);
    Game.display.draw(
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
  tryMove(x, y) {
    // returns true if walkable else false
    var tile = Game._map.getTile(x, y);
    // Check if we can walk on the tile
    if (tile.isWalkable()) {
      return true;
    }
    return false;
  }
}
