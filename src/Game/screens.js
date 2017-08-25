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
        // Movement
        switch (inputData.keyCode) {
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
          case ROT.VK_I:
            if (!this._player.getItems()) {
              // If the player has no items, send a message and don't take a turn
              Messages.sendMessage(
                this._player,
                'You are not carrying anything!'
              );
              Game.refresh();
            } else {
              // Show the inventory
              Screen.inventoryScreen.setup(
                this._player,
                this._player.getItems()
              );
              this.setSubScreen(Screen.inventoryScreen);
            }
            return;
          case ROT.VK_D:
            if (!this._player.getItems()) {
              // If the player has no items, send a message and don't take a turn
              Messages.sendMessage(this._player, 'You have nothing to drop!');
              Game.refresh();
            } else {
              // Show the drop screen
              Screen.dropScreen.setup(this._player, this._player.getItems());
              this.setSubScreen(Screen.dropScreen);
            }
            return;
          case ROT.VK_COMMA:
            const items = this._map.getItemsAt(
              this._player.getX(),
              this._player.getY(),
              this._player.getZ()
            );
            // If there are no items, show a message
            if (!items) {
              Messages.sendMessage(
                this._player,
                'There is nothing here to pick up.'
              );
            } else if (items.length === 1) {
              // If only one item, try to pick it up
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
              Screen.pickupScreen.setup(this._player, items);
              this.setSubScreen(Screen.pickupScreen);
              return;
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
    // Whether the user can select items at all.
    this._canSelectItem = template['canSelect'];
    // Whether the user can select multiple items.
    this._canSelectMultipleItems = template['canSelectMultipleItems'];
  }

  setup(player, items) {
    this._player = player;
    // Should be called before switching to the screen.
    this._items = items;
    // Clean set of selected indices
    this._selectedIndices = {};
  }

  // Render a list of items as well as the selection states and the caption.
  render(display) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    // Render the caption in the top row
    display.drawText(0, 0, this._caption);
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
        // Render at the correct row and add 2.
        display.drawText(
          0,
          2 + row,
          letter + ' ' + selectionState + ' ' + this._items[i].describe()
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
      Game.sendMessage(
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

export default Screen;
