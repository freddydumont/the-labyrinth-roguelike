import { ROT, Game } from '../game';
import * as Messages from '../messages';
import Screen from './index';

class ItemListScreen {
  constructor(template) {
    // Set up based on the template
    this._caption = template['caption'];
    this._okFunction = template['ok'];
    this._yesFunction = template['yes'];
    this._noFunction = template['no'];
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
    // Whether the user has to input a Y/N choice
    this._extraInput = false;
    this._yes = undefined;
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
        // Check if the item is worn, wielded, an edible on the ground, or ammo
        let suffix = '';
        if (this._items[i] === this._player.getArmor()) {
          suffix = ' (wearing)';
        } else if (this._items[i] === this._player.getWeapon()) {
          suffix = ' (wielding)';
        } else if (
          this._items[i].hasMixin('Edible') &&
          this._items[i].getGroundStatus()
        ) {
          suffix = ' (on the ground)';
        } else if (this._items[i].hasMixin('Ammo')) {
          suffix = ` (${this._items[i].getCount()})`;
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

    // Call the OK function and end the player's turn if it returns true.
    if (this._okFunction(selectedItems)) {
      // Switch back to the play screen.
      Screen.playScreen.setSubScreen(undefined);
      this._player.getMap().getEngine().unlock();
    }
  }

  handleInput(inputType, inputData) {
    // if no extra input is required, these are the keys
    if (!this._extraInput) {
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
    } else {
      // if we are waiting for an extra input
      if (inputData.keyCode === ROT.VK_Y) {
        // Y: set yes to true and call ok function
        this._yes = true;
        this.executeOkFunction();
      } else if (inputData.keyCode === ROT.VK_N) {
        // N: set yes to false and call ok function
        this._yes = false;
        this.executeOkFunction();
      }
    }
  }
}

export const inventoryScreen = new ItemListScreen({
  caption: 'Inventory',
  canSelect: false,
});

export const pickupScreen = new ItemListScreen({
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
  },
});

export const dropScreen = new ItemListScreen({
  caption: 'Choose the item you wish to drop',
  canSelect: true,
  canSelectMultipleItems: false,

  ok: function(selectedItems) {
    // Drop the selected item
    this._player.dropItem(Object.keys(selectedItems)[0]);
    return true;
  },
});

export const eatScreen = new ItemListScreen({
  caption: 'Choose the item you wish to eat',
  canSelect: true,
  canSelectMultipleItems: false,

  isAcceptable: function(item) {
    return item && item.hasMixin('Edible');
  },

  ok: function(selectedItems) {
    // grab selected key and item
    const key = Object.keys(selectedItems)[0];
    const item = selectedItems[key];

    // if not waiting for extra input
    if (!this._extraInput) {
      // Check satiation level to warn before overeating death
      if (this._player.getSatiation() < item.getFoodValue()) {
        // Clear previous messages
        this._player.clearMessages();
        // Warn player with a message
        Messages.sendMessage(
          this._player,
          'This looks like a pretty big bite.\nAre you sure you want to proceed? Y/N'
        );

        // display messages in current screen
        Messages.renderMessages.call(this, Game.getDisplay());

        // set extraInput to true to change screen controls
        this._extraInput = true;
        // return false to keep engine locked while waiting for input
        return false;
      } else {
        // return yes function to eat item
        return this._yesFunction(item, key);
      }
    } else {
      // if waiting for extra input, set it to false
      this._extraInput = false;
      // this._yes should not ne undefined
      if (typeof this._yes !== 'undefined') {
        // clear messages and refresh
        this._player.clearMessages();
        Game.refresh();
        // if yes is true, return yes function, else return no
        return this._yes ? this._yesFunction(item, key) : this._noFunction();
      }
      // return true in case of error
      return true;
    }
  },

  yes: function(item, key) {
    // Eat the item, removing it if there are no consumptions remaining.
    Messages.sendMessage(this._player, 'You eat %s.', [item.describeThe()]);
    item.eat(this._player);
    if (!item.hasRemainingConsumptions()) {
      if (item.getGroundStatus()) {
        // remove from ground
        this._player
          .getMap()
          .removeItemAt(
            this._player.getX(),
            this._player.getY(),
            this._player.getZ(),
            item
          );
      }
      this._player.removeItem(key);
    }
    return true;
  },

  no: function() {
    return true;
  },
});

export const wieldScreen = new ItemListScreen({
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
        item.describeA(),
      ]);
    }
    return true;
  },
});

export const wearScreen = new ItemListScreen({
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
        item.describeA(),
      ]);
    }
    return true;
  },
});

export const examineScreen = new ItemListScreen({
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
        item.details(),
      ]);
    }
    return true;
  },
});

export const throwScreen = new ItemListScreen({
  caption: 'Choose the item you wish to throw',
  canSelect: true,
  canSelectMultipleItems: false,

  // Acceptable items have the 'Throwable' mixin
  isAcceptable: function(item) {
    return item && item.hasMixin('Throwable');
  },

  ok: function(selectedItems) {
    // grab selected key and item
    const key = Object.keys(selectedItems)[0];
    const item = selectedItems[key];
    // Setup the throwAt screen with extra args
    const offsets = Screen.playScreen.getScreenOffsets();
    Screen.throwAtScreen.setup(
      this._player,
      this._player.getX(),
      this._player.getY(),
      offsets.x,
      offsets.y,
      [item, key]
    );
    // switch to throwAt screen
    Screen.playScreen.setSubScreen(Screen.throwAtScreen);
  },
});
