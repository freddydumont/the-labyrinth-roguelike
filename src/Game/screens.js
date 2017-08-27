import { ROT, Game } from './game';
import * as Maps from './map';
import * as Messages from './messages';
import Entity from './entity';
import { Player } from './entities';
import Builder from './builder';

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
      this._map = new Maps.Map(tiles, this._player);
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
      // render map and messages
      Maps.renderMap.call(this, display);
      Messages.renderMessages.call(this, display);
      // Render hunger state
      let hungerState = this._player.getHungerState();
      display.drawText(
        Game._screenWidth - hungerState.length,
        Game._screenHeight,
        hungerState
      );
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
          case ROT.VK_COMMA:
            if (!inputData.shiftKey) {
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
            }
            break;
          default:
            //not a valid key
            return;
        }
        // Unlock the engine
        this._map.getEngine().unlock();
      } else if (inputType === 'keypress') {
        const keyChar = String.fromCharCode(inputData.charCode);
        switch (keyChar) {
          case '>':
            this.move(0, 0, 1);
            break;
          case '<':
            this.move(0, 0, -1);
            break;
          default:
            // Not a valid key
            return;
        }
        // Unlock the engine
        this._map.getEngine().unlock();
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
    let that = this;
    this._items = items.map(function(item) {
      // Transform the item into null if it's not acceptable
      if (that._isAcceptableFunction(item)) {
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

export default Screen;
