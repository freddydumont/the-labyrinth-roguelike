import { Game } from './game';
import Entity from './entity';

export default class Being extends Entity {
  constructor(props) {
    super(props);
    this.health = 3;
    this.defence = 0;
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
  combat(entity) {
    this.health -= entity.attack - this.defence;
    console.log(this, this.health);
    // todo: entity color changed for .5s when taking damage
    if (this.health <= 0) {
      if (this.name === 'player') {
        // todo: endgame
        console.log('player died');
        Game.engine.lock();
      }
      // todo: remove scheduler, remove entity
    }
  }
}
