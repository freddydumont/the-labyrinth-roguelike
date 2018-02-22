import Screen from './index';
import { ROT, Game } from '../game';
import Geometry from '../geometry';
import TileRepository from '../Repositories/tileRepository';
import * as Messages from '../messages';

class TargetBasedScreen {
  constructor(template = {}) {
    // By default, our ok return does nothing and does not consume a turn.
    this._okFunction =
      template['ok'] ||
      function(x, y) {
        return false;
      };

    // The defaut caption function returns a description of the tile
    this._captionFunction =
      template['captionFunction'] ||
      function captionFunction(x, y) {
        const z = this._player.getZ();
        const map = this._player.getMap();
        // If the tile is explored, we can give a better caption
        if (map.isExplored(x, y, z)) {
          // If the tile isn't explored, we have to check if we can actually
          // see it before testing if there's an entity or item.
          if (this._visibleCells[x + ',' + y]) {
            const items = map.getItemsAt(x, y, z);
            // If we have items, we want to render the top most item
            if (items) {
              const item = items[items.length - 1];
              return String.format(
                '%s - %s (%s)',
                item.getRepresentation(),
                item.describeA(true),
                item.details()
              );
              // Else check if there's an entity
            } else if (map.getEntityAt(x, y, z)) {
              var entity = map.getEntityAt(x, y, z);
              return String.format(
                '%s - %s (%s)',
                entity.getRepresentation(),
                entity.describeA(true),
                entity.details()
              );
            }
          }
          // If there was no entity/item or the tile wasn't visible, then use
          // the tile information.
          return String.format(
            '%s - %s',
            map.getTile(x, y, z).getRepresentation(),
            map.getTile(x, y, z).getDescription()
          );
        } else {
          // If the tile is not explored, show the null tile description.
          return String.format(
            '%s - %s',
            TileRepository.create('null').getRepresentation(),
            TileRepository.create('null').getDescription()
          );
        }
      };
  }

  setup(player, startX, startY, offsetX, offsetY, args) {
    this._player = player;
    // Store original position. Subtract the offset to make life easy so we don't
    // always have to remove it.
    this._startX = startX - offsetX;
    this._startY = startY - offsetY;
    // Store current cursor position
    this._cursorX = this._startX;
    this._cursorY = this._startY;
    // Store map offsets
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    // Cache the FOV
    let visibleCells = {};
    this._player
      .getMap()
      .getFov(this._player.getZ())
      .compute(
        this._player.getX(),
        this._player.getY(),
        this._player.getSightRadius(),
        function(x, y, radius, visibility) {
          visibleCells[x + ',' + y] = true;
        }
      );
    this._visibleCells = visibleCells;

    // if args array is present, assign values
    if (args) {
      this._item = args[0];
      this._key = args[1];
    }
  }

  render(display) {
    Screen.playScreen.renderTiles.call(Screen.playScreen, display);

    // Draw a line from the start to the cursor.
    let points = Geometry.getLine(
      this._startX,
      this._startY,
      this._cursorX,
      this._cursorY
    );

    // Render stars along the line.
    for (let i = 0, l = points.length; i < l; i++) {
      display.drawText(points[i].x, points[i].y, '%c{magenta}*');
    }

    // Render the caption at the bottom.
    display.drawText(
      0,
      Game.getScreenHeight() - 1,
      this._captionFunction(
        this._cursorX + this._offsetX,
        this._cursorY + this._offsetY
      )
    );
  }

  handleInput(inputType, inputData) {
    // Move the cursor
    if (inputType === 'keydown') {
      if (inputData.keyCode === ROT.VK_LEFT) {
        this.moveCursor(-1, 0);
      } else if (inputData.keyCode === ROT.VK_RIGHT) {
        this.moveCursor(1, 0);
      } else if (inputData.keyCode === ROT.VK_UP) {
        this.moveCursor(0, -1);
      } else if (inputData.keyCode === ROT.VK_DOWN) {
        this.moveCursor(0, 1);
      } else if (inputData.keyCode === ROT.VK_ESCAPE) {
        Screen.playScreen.setSubScreen(undefined);
      } else if (inputData.keyCode === ROT.VK_RETURN) {
        this.executeOkFunction();
      }
    }
    Game.refresh();
  }

  moveCursor(dx, dy) {
    // Make sure we stay within bounds.
    this._cursorX = Math.max(
      0,
      Math.min(this._cursorX + dx, Game.getScreenWidth())
    );
    // We have to save the last line for the caption.
    this._cursorY = Math.max(
      0,
      Math.min(this._cursorY + dy, Game.getScreenHeight() - 1)
    );
  }

  executeOkFunction() {
    // Switch back to the play screen.
    Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it return true.
    if (
      this._okFunction(
        this._cursorX + this._offsetX,
        this._cursorY + this._offsetY
      )
    ) {
      // message const to work around the unlock
      const message = this._player.getMessages()[0];
      this._player.getMap().getEngine().unlock();
      this._player.receiveMessage(message);
    }
  }
}

export const lookScreen = new TargetBasedScreen({});

export const throwAtScreen = new TargetBasedScreen({
  ok: function(x, y) {
    // test throwItem call to return appropriate bool to executeOkFunction()
    if (
      this._player.throwItem(this._item, this._key, x, y, this._player.getZ())
    ) {
      return true;
    } else {
      // if it returns false, send message you cannot throw there
      Messages.sendMessage(this._player, 'You cannot throw there!');
      return false;
    }
  },
});

export const fireScreen = new TargetBasedScreen({
  ok: function(x, y) {
    if (
      this._player.hasMixin('Sight') &&
      this._player.canSee(x, y) &&
      this._player.getMap().getTile(x, y, this.getZ()).isWalkable()
    ) {
      // remove ammo, there should be a 50% chance to recover it
      console.log('-1 ammo');
      // get target at coordinates
      const target = this._player
        .getMap()
        .getEntityAt(x, y, this._player.getZ());
      // if there is an entity, attack it
      if (target) {
        this._player.rangedAttack(target);
        return true;
      } else {
        // otherwise place ammo at coords
        console.log(`fired at ${x},${y}`);
        return true;
      }
    } else {
      // if it returns false, send message you cannot throw there
      Messages.sendMessage(this._player, 'You cannot fire %s there!', [
        this._player.getWeapon().describeThe(false),
      ]);
      return false;
    }
  },
});
