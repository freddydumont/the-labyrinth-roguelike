import { ROT, Game } from './game';
import Entity from './entity';

export default class Player extends Entity {
  act() {
    Game.engine.lock();
    // wait for user input; do stuff when user hits a key
    window.addEventListener('keydown', this);
  }

  handleEvent(e) {
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

    // Mixin.Moveable
    if (this.tryMove(newX, newY)) {
      this.newPosition(newX, newY);
      this.endTurn();
    }
  }
  newPosition(newX, newY) {
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
  endTurn() {
    console.log('player:', this.getX(), this.getY());
    console.log('enemy:', Game.enemy.getX(), Game.enemy.getY());
    // turn has ended, remove event listener and unlock engine
    window.removeEventListener('keydown', this);
    Game.engine.unlock();
  }
}
