import Screen from './index';
import { ROT, Game } from '../game';
import Geometry from '../geometry';
import TileRepository from '../tileRepository';

class TargetBasedScreen {
  constructor(template = {}) {
    // By default, our ok return does nothing and does not consume a turn.
    this._okFunction =
      template['okFunction'] ||
      function(x, y) {
        return false;
      };

    // The defaut caption function simply returns an empty string.
    this._captionFunction =
      template['captionFunction'] ||
      function(x, y) {
        return '';
      };
  }

  setup(player, startX, startY, offsetX, offsetY) {
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
      this._player.getMap().getEngine().unlock();
    }
  }
}

export const lookScreen = new TargetBasedScreen({
  captionFunction: function(x, y) {
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
  },
});
