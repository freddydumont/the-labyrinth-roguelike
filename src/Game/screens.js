import { vsprintf } from 'sprintf-js';
import { ROT, Game } from './game';
import Map from './map';
import * as Messages from './messages';
import Entity from './entity';
import { Player } from './entities';
import Builder from './builder';
import { Geometry } from './geometry';
import Tile from './tile.js';

let Screen = {
  startScreen: {
    enter: function() {
      console.log('Entered start screen.');
    },
    exit: function() {
      console.log('Exited start screen.');
    },
    render: function(display) {
      // Render our prompt to the screen
      display.drawText(1, 1, '%c{yellow}Javascript Roguelike');
      display.drawText(1, 2, 'Press [Enter] to start!');
    },
    handleInput: function(inputType, inputData) {
      // When [Enter] is pressed, go to the play screen
      if (inputType === 'keydown') {
        if (inputData.keyCode === ROT.VK_RETURN) {
          Game.switchScreen(Screen.playScreen);
        }
      }
    }
  },

  playScreen: {
    _map: null,
    _player: null,
    _gameEnded: false,
    _subScreen: null,

    enter: function() {
      // size parameters
      const width = 100,
        height = 48,
        depth = 6;
      // declare tiles and player
      let tiles = new Builder(width, height, depth).getTiles();
      this._player = new Entity(Player);
      // build map with tiles and player
      this._map = new Map(tiles, this._player);
      // Start the map's engine
      this._map.getEngine().start();
    },

    exit: function() {
      console.log('Exited play screen.');
    },

    render: function(display) {
      // Render subscreen if there is one
      if (this._subScreen) {
        this._subScreen.render(display);
        return;
      }
      // Render the tiles
      this.renderTiles(display);
      // Get the messages in the player's queue and render them
      Messages.renderMessages.call(this, display);

      // Render player stats
      let stats = '%c{white}%b{black}';
      stats += vsprintf('HP: %d/%d ATK: %d DEF: %d L: %d XP: %d', [
        this._player.getHp(),
        this._player.getMaxHp(),
        this._player.getAttackValue(),
        this._player.getDefenseValue(),
        this._player.getLevel(),
        this._player.getExperience()
      ]);
      display.drawText(0, Game.getScreenHeight(), stats);

      // Render hunger state
      const hungerState = this._player.getHungerState();
      display.drawText(
        Game.getScreenWidth() - hungerState.length,
        Game.getScreenHeight(),
        hungerState
      );
    },

    getScreenOffsets: function() {
      // Make sure we still have enough space to fit an entire game screen
      let topLeftX = Math.max(
        0,
        this._player.getX() - Game.getScreenWidth() / 2
      );
      // Make sure we still have enough space to fit an entire game screen
      topLeftX = Math.min(
        topLeftX,
        this._player.getMap().getWidth() - Game.getScreenWidth()
      );
      // Make sure the y-axis doesn't above the top bound
      let topLeftY = Math.max(
        0,
        this._player.getY() - Game.getScreenHeight() / 2
      );
      // Make sure we still have enough space to fit an entire game screen
      topLeftY = Math.min(
        topLeftY,
        this._player.getMap().getHeight() - Game.getScreenHeight()
      );
      return {
        x: topLeftX,
        y: topLeftY
      };
    },

    renderTiles: function(display) {
      const screenWidth = Game.getScreenWidth();
      const screenHeight = Game.getScreenHeight();
      const offsets = this.getScreenOffsets();
      const topLeftX = offsets.x;
      const topLeftY = offsets.y;
      // This object will keep track of all visible map cells
      let visibleCells = {};
      // Store this._player.getMap() and player's z to prevent losing it in callbacks
      const map = this._player.getMap();
      const player = this._player;
      const currentDepth = this._player.getZ();
      // Find all visible cells and update the object
      map
        .getFov(currentDepth)
        .compute(
          player.getX(),
          player.getY(),
          player.getSightRadius(),
          (x, y, radius, visibility) => {
            visibleCells[x + ',' + y] = true;
            // Mark cell as explored
            map.setExplored(x, y, currentDepth, true);
          }
        );

      // Iterate through all visible map cells
      for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
        for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
          if (visibleCells[x + ',' + y]) {
            // Fetch the glyph for the tile and render it to the screen at the offset position.
            let tile = map.getTile(x, y, player.getZ());
            display.draw(
              x - topLeftX,
              y - topLeftY,
              tile.getChar(),
              tile.getForeground(),
              tile.getBackground()
            );
          }
        }
      }

      // Render the explored map cells
      for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
        for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
          if (map.isExplored(x, y, currentDepth)) {
            // Fetch the glyph for the tile and render it to the screen
            // at the offset position.
            let glyph = map.getTile(x, y, currentDepth);
            let foreground = glyph.getForeground();
            // If we are at a cell that is in the field of vision, we need
            // to check if there are items or entities.
            if (visibleCells[x + ',' + y]) {
              // Check for items first, since we want to draw entities over items.
              const items = map.getItemsAt(x, y, currentDepth);
              // If we have items, we want to render the top most item
              if (items) {
                glyph = items[items.length - 1];
              }
              // Check if we have an entity at the position
              if (map.getEntityAt(x, y, currentDepth)) {
                glyph = map.getEntityAt(x, y, currentDepth);
              }
              // Update the foreground color in case our glyph changed
              foreground = glyph.getForeground();
            } else {
              // Since the tile was previously explored but is not visible,
              // we want to change the foreground color to dark gray.
              foreground = 'darkgray';
            }
            display.draw(
              x - topLeftX,
              y - topLeftY,
              glyph.getChar(),
              foreground,
              glyph.getBackground()
            );
          }
        }
      }

      // Render the entities
      let entities = map.getEntities();
      for (const key in entities) {
        const entity = entities[key];
        // Only render the entity if they would show up on the screen
        if (
          entity.getX() >= topLeftX &&
          entity.getY() >= topLeftY &&
          entity.getX() < topLeftX + screenWidth &&
          entity.getY() < topLeftY + screenHeight &&
          entity.getZ() === player.getZ()
        ) {
          if (visibleCells[entity.getX() + ',' + entity.getY()]) {
            display.draw(
              entity.getX() - topLeftX,
              entity.getY() - topLeftY,
              entity.getChar(),
              entity.getForeground(),
              entity.getBackground()
            );
          }
        }
      }
    },

    handleInput: function(inputType, inputData) {
      // If the game is over, enter will bring the user to the losing screen.
      if (this._gameEnded) {
        if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
          Game.switchScreen(Screen.loseScreen);
        }
        // Return to make sure the user can't still play
        return;
      }

      // Handle subscreen input if there is one
      if (this._subScreen) {
        this._subScreen.handleInput(inputType, inputData);
        return;
      }

      if (inputType === 'keydown') {
        switch (inputData.keyCode) {
          // MOVEMENT
          case ROT.VK_LEFT:
            this.move(-1, 0, 0);
            break;
          case ROT.VK_RIGHT:
            this.move(1, 0, 0);
            break;
          case ROT.VK_UP:
            this.move(0, -1, 0);
            break;
          case ROT.VK_DOWN:
            this.move(0, 1, 0);
            break;
          // ITEMS
          case ROT.VK_I:
            // Show the inventory screen
            this.showItemsSubScreen(
              Screen.inventoryScreen,
              this._player.getItems(),
              'You are not carrying anything.'
            );
            return;
          case ROT.VK_D:
            // Show the drop screen
            this.showItemsSubScreen(
              Screen.dropScreen,
              this._player.getItems(),
              'You have nothing to drop.'
            );
            return;
          case ROT.VK_E:
            // Show the eat screen
            this.showItemsSubScreen(
              Screen.eatScreen,
              this._player.getItems(),
              'You have nothing to eat.'
            );
            return;
          case ROT.VK_W:
            if (inputData.shiftKey) {
              // Show the wear screen
              this.showItemsSubScreen(
                Screen.wearScreen,
                this._player.getItems(),
                'You have nothing to wear.'
              );
            } else {
              // Show the wield screen
              this.showItemsSubScreen(
                Screen.wieldScreen,
                this._player.getItems(),
                'You have nothing to wield.'
              );
            }
            return;
          case ROT.VK_X:
            // Show the examine screen
            this.showItemsSubScreen(
              Screen.examineScreen,
              this._player.getItems(),
              'You have nothing to examine.'
            );
            return;
          case ROT.VK_COMMA:
            if (!inputData.shiftKey) {
              // Pick up item
              const items = this._map.getItemsAt(
                this._player.getX(),
                this._player.getY(),
                this._player.getZ()
              );
              // If only one item, try to pick it up
              if (items.length === 1) {
                const item = items[0];
                if (this._player.pickupItems([0])) {
                  Messages.sendMessage(this._player, 'You pick up %s.', [
                    item.describeA()
                  ]);
                } else {
                  Messages.sendMessage(
                    this._player,
                    'Your inventory is full! Nothing was picked up.'
                  );
                }
              } else {
                // Show the pickup screen if there are many items
                // or show a message if there is nothing
                this.showItemsSubScreen(
                  Screen.pickupScreen,
                  items,
                  'There is nothing here to pick up.'
                );
              }
            } else {
              // Move up a level
              this.move(0, 0, -1);
            }
            break;
          case ROT.VK_PERIOD:
            // Skip a turn or:
            if (inputData.shiftKey) {
              // Move down a level
              this.move(0, 0, 1);
            }
            break;
          // keycode for ;
          case 186:
            // Setup the look screen.
            const offsets = this.getScreenOffsets();
            Screen.lookScreen.setup(
              this._player,
              this._player.getX(),
              this._player.getY(),
              offsets.x,
              offsets.y
            );
            this.setSubScreen(Screen.lookScreen);
            return;
          default:
            // Not a valid key
            return;
        }
        // Unlock the engine
        this._map.getEngine().unlock();
      } else if (inputType === 'keypress') {
        if (inputData.keyCode === ROT.VK_QUESTION_MARK) {
          this.setSubScreen(Screen.helpScreen);
        }
      }
    },

    move: function(dX, dY, dZ) {
      let newX = this._player.getX() + dX;
      let newY = this._player.getY() + dY;
      let newZ = this._player.getZ() + dZ;
      // Try to move to the new cell
      this._player.tryMove(newX, newY, newZ, this._map);
    },

    setGameEnded: function(gameEnded) {
      this._gameEnded = gameEnded;
    },

    setSubScreen: function(subScreen) {
      this._subScreen = subScreen;
      // Refresh screen on changing the subscreen
      Game.refresh();
    },

    showItemsSubScreen: function(subScreen, items, emptyMessage) {
      if (items && subScreen.setup(this._player, items) > 0) {
        this.setSubScreen(subScreen);
      } else {
        Messages.sendMessage(this._player, emptyMessage);
        Game.refresh();
      }
    }
  },

  winScreen: {
    enter: function() {
      console.log('Entered win screen.');
    },
    exit: function() {
      console.log('Exited win screen.');
    },
    render: function(display) {
      // Render our prompt to the screen
      for (let i = 0; i < 22; i++) {
        // Generate random background colors
        const r = Math.round(Math.random() * 255);
        const g = Math.round(Math.random() * 255);
        const b = Math.round(Math.random() * 255);
        const background = ROT.Color.toRGB([r, g, b]);
        display.drawText(2, i + 1, '%b{' + background + '}You win!');
      }
    },
    handleInput: function(inputType, inputData) {
      // nothing to do here
    }
  },

  gainStatScreen: {
    setup: function(entity) {
      // Must be called before rendering.
      this._entity = entity;
      this._options = entity.getStatOptions();
    },

    render: function(display) {
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      display.drawText(0, 0, 'Choose a stat to increase: ');

      // Iterate through each of our options
      for (let i = 0; i < this._options.length; i++) {
        display.drawText(
          0,
          2 + i,
          letters.substring(i, i + 1) + ' - ' + this._options[i][0]
        );
      }

      // Render remaining stat points
      display.drawText(
        0,
        4 + this._options.length,
        'Remaining points: ' + this._entity.getStatPoints()
      );
    },

    handleInput: function(inputType, inputData) {
      if (inputType === 'keydown') {
        // If a letter was pressed, check if it matches to a valid option.
        if (inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {
          // Check if it maps to a valid item by subtracting 'a' from the character
          // to know what letter of the alphabet we used.
          const index = inputData.keyCode - ROT.VK_A;
          if (this._options[index]) {
            // Call the stat increasing function
            this._options[index][1].call(this._entity);
            // Decrease stat points
            this._entity.setStatPoints(this._entity.getStatPoints() - 1);
            // If we have no stat points left, exit the screen, else refresh
            if (this._entity.getStatPoints() === 0) {
              Screen.playScreen.setSubScreen(undefined);
            } else {
              Game.refresh();
            }
          }
        }
      }
    }
  },

  loseScreen: {
    enter: function() {
      console.log('Entered lose screen.');
    },
    exit: function() {
      console.log('Exited lose screen.');
    },
    render: function(display) {
      // Render our prompt to the screen
      for (let i = 0; i < 22; i++) {
        display.drawText(2, i + 1, '%b{red}You lose! :(');
      }
    },
    handleInput: function(inputType, inputData) {
      // nothing to do here
    }
  },

  helpScreen: {
    render: function(display) {
      let text = 'Help';
      const border = '-------------';
      let y = 0;
      display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
      display.drawText(
        Game.getScreenWidth() / 2 - border.length / 2,
        y++,
        border
      );
      y++;
      display.drawText(
        0,
        y++,
        'You have been tasked to enter the Labyrinth and slay the Minotaur.'
      );
      display.drawText(0, y++, 'Find him and end his tyranny!');
      y += 3;
      display.drawText(0, y++, '[.] to wait');
      display.drawText(0, y++, '[,] to pick up items');
      display.drawText(0, y++, '[d] to drop items');
      display.drawText(0, y++, '[e] to eat items');
      display.drawText(0, y++, '[w] to wield items');
      display.drawText(0, y++, '[W] to wear items');
      display.drawText(0, y++, '[x] to examine items');
      display.drawText(0, y++, '[;] to look around you');
      display.drawText(0, y++, '[?] to show this help screen');
      y += 3;
      text = '--- press any key to continue ---';
      display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    },

    handleInput: function(inputType, inputData) {
      Screen.playScreen.setSubScreen(null);
    }
  }
};

class ItemListScreen {
  constructor(template) {
    // Set up based on the template
    this._caption = template['caption'];
    this._okFunction = template['ok'];
    // By default, we use the identity function
    this._isAcceptableFunction =
      template['isAcceptable'] ||
      function(x) {
        return x;
      };
    // Whether the user can select items at all.
    this._canSelectItem = template['canSelect'];
    // Whether the user can select multiple items.
    this._canSelectMultipleItems = template['canSelectMultipleItems'];
    // Whether a 'no item' option should appear.
    this._hasNoItemOption = template['hasNoItemOption'];
  }

  setup(player, items) {
    // Return if player has no items
    if (!items) return false;
    this._player = player;
    // Should be called before switching to the screen.
    let count = 0;
    // Iterate over each item, keeping only the aceptable ones and counting
    // the number of acceptable items.
    this._items = items.map(item => {
      // Transform the item into null if it's not acceptable
      if (this._isAcceptableFunction(item)) {
        count++;
        return item;
      } else {
        return null;
      }
    });
    // Clean set of selected indices
    this._selectedIndices = {};
    return count;
  }

  // Render a list of items as well as the selection states and the caption.
  render(display) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    // Render the caption in the top row
    display.drawText(0, 0, this._caption);
    // Render the no item row if enabled
    if (this._hasNoItemOption) {
      display.drawText(0, 1, '0 - no item');
    }
    let row = 0;
    for (let i = 0; i < this._items.length; i++) {
      // If we have an item, we want to render it.
      if (this._items[i]) {
        // Get the letter matching the item's index
        const letter = letters.substring(i, i + 1);
        // If we have selected an item, show a +, else show a dash between
        // the letter and the item's name.
        const selectionState =
          this._canSelectItem &&
          this._canSelectMultipleItems &&
          this._selectedIndices[i]
            ? '+'
            : '-';
        // Check if the item is worn or wielded
        let suffix = '';
        if (this._items[i] === this._player.getArmor()) {
          suffix = ' (wearing)';
        } else if (this._items[i] === this._player.getWeapon()) {
          suffix = ' (wielding)';
        }
        // Render at the correct row and add 2.
        display.drawText(
          0,
          2 + row,
          letter +
            ' ' +
            selectionState +
            ' ' +
            this._items[i].describe() +
            suffix
        );
        row++;
      }
    }
  }

  /**
   * Helper function which takes care of gathering the selected items,
   * calls the ok function with a hashtable mapping indexes to items,
   * and ends the turn if necessary.
   */
  executeOkFunction() {
    // Gather the selected items.
    let selectedItems = {};
    for (const key in this._selectedIndices) {
      selectedItems[key] = this._items[key];
    }
    // Switch back to the play screen.
    Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it returns true.
    if (this._okFunction(selectedItems)) {
      this._player.getMap().getEngine().unlock();
    }
  }

  handleInput(inputType, inputData) {
    if (inputType === 'keydown') {
      // If the user hits escape, hits enter and can't select an item, or hits
      // enter without any items selected, simply cancel out
      if (
        inputData.keyCode === ROT.VK_ESCAPE ||
        (inputData.keyCode === ROT.VK_RETURN &&
          (!this._canSelectItem ||
            Object.keys(this._selectedIndices).length === 0))
      ) {
        Screen.playScreen.setSubScreen(undefined);
        // Handle pressing return when items are selected
      } else if (inputData.keyCode === ROT.VK_RETURN) {
        this.executeOkFunction();
        // Handle pressing zero when 'no item' selection is enabled
      } else if (
        this._canSelectItem &&
        this._hasNoItemOption &&
        inputData.keyCode === ROT.VK_0
      ) {
        this._selectedIndices = {};
        this.executeOkFunction();
        // Handle pressing a letter if we can select
      } else if (
        this._canSelectItem &&
        inputData.keyCode >= ROT.VK_A &&
        inputData.keyCode <= ROT.VK_Z
      ) {
        // Check if it maps to a valid item by subtracting 'a' from the character
        // to know what letter of the alphabet we used.
        const index = inputData.keyCode - ROT.VK_A;
        if (this._items[index]) {
          // If multiple selection is allowed, toggle the selection status, else
          // select the item and exit the screen
          if (this._canSelectMultipleItems) {
            if (this._selectedIndices[index]) {
              delete this._selectedIndices[index];
            } else {
              this._selectedIndices[index] = true;
            }
            // Redraw screen
            Game.refresh();
          } else {
            this._selectedIndices[index] = true;
            this.executeOkFunction();
          }
        }
      }
    }
  }
}

Screen.inventoryScreen = new ItemListScreen({
  caption: 'Inventory',
  canSelect: false
});

Screen.pickupScreen = new ItemListScreen({
  caption: 'Choose the items you wish to pickup',
  canSelect: true,
  canSelectMultipleItems: true,

  ok: function(selectedItems) {
    // Try to pick up all items, messaging the player if they couldn't all be
    // picked up.
    if (!this._player.pickupItems(Object.keys(selectedItems))) {
      Messages.sendMessage(
        this._player,
        'Your inventory is full! Not all items were picked up.'
      );
    }
    return true;
  }
});

Screen.dropScreen = new ItemListScreen({
  caption: 'Choose the item you wish to drop',
  canSelect: true,
  canSelectMultipleItems: false,

  ok: function(selectedItems) {
    // Drop the selected item
    this._player.dropItem(Object.keys(selectedItems)[0]);
    return true;
  }
});

Screen.eatScreen = new ItemListScreen({
  caption: 'Choose the item you wish to eat',
  canSelect: true,
  canSelectMultipleItems: false,
  isAcceptable: function(item) {
    return item && item.hasMixin('Edible');
  },
  ok: function(selectedItems) {
    // Eat the item, removing it if there are no consumptions remaining.
    const key = Object.keys(selectedItems)[0];
    let item = selectedItems[key];
    Messages.sendMessage(this._player, 'You eat %s.', [item.describeThe()]);
    item.eat(this._player);
    if (!item.hasRemainingConsumptions()) {
      this._player.removeItem(key);
    }
    return true;
  }
});

Screen.wieldScreen = new ItemListScreen({
  caption: 'Choose the item you wish to wield',
  canSelect: true,
  canSelectMultipleItems: false,
  hasNoItemOption: true,

  isAcceptable: function(item) {
    return item && item.hasMixin('Equippable') && item.isWieldable();
  },

  ok: function(selectedItems) {
    // Check if we selected 'no item'
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this._player.unwield();
      Messages.sendMessage(this._player, 'You are not wielding anything.');
    } else {
      // Make sure to unequip the item first in case it is the armor.
      const item = selectedItems[keys[0]];
      this._player.unequip(item);
      this._player.wield(item);
      Messages.sendMessage(this._player, 'You are wielding %s.', [
        item.describeA()
      ]);
    }
    return true;
  }
});

Screen.wearScreen = new ItemListScreen({
  caption: 'Choose the item you wish to wear',
  canSelect: true,
  canSelectMultipleItems: false,
  hasNoItemOption: true,

  isAcceptable: function(item) {
    return item && item.hasMixin('Equippable') && item.isWearable();
  },

  ok: function(selectedItems) {
    // Check if we selected 'no item'
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this._player.takeOff();
      Messages.sendMessage(this._player, 'You are not wearing anthing.');
    } else {
      // Make sure to unequip the item first in case it is the weapon.
      const item = selectedItems[keys[0]];
      this._player.unequip(item);
      this._player.wear(item);
      Messages.sendMessage(this._player, 'You are wearing %s.', [
        item.describeA()
      ]);
    }
    return true;
  }
});
Screen.examineScreen = new ItemListScreen({
  caption: 'Choose the item you wish to examine',
  canSelect: true,
  canSelectMultipleItems: false,
  isAcceptable: function(item) {
    return true;
  },
  ok: function(selectedItems) {
    const keys = Object.keys(selectedItems);
    if (keys.length > 0) {
      let item = selectedItems[keys[0]];
      Messages.sendMessage(this._player, "It's %s (%s).", [
        item.describeA(false),
        item.details()
      ]);
    }
    return true;
  }
});

class TargetBasedScreen {
  constructor(template) {
    template = template || {};
    this._isAcceptableFunction =
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

Screen.lookScreen = new TargetBasedScreen({
  captionFunction: function(x, y) {
    const z = this._player.getZ();
    const map = this._player.getMap();
    // If the tile is explored, we can give a better capton
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
        Tile.nullTile.getRepresentation(),
        Tile.nullTile.getDescription()
      );
    }
  }
});

export default Screen;
