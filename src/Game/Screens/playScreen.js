import { vsprintf } from 'sprintf-js';
import { ROT, Game } from '../game';
import Map from '../map';
import * as Messages from '../messages';
import Entity from '../entity';
import { Player } from '../entities';
import Builder from '../builder';
import Screen from './index';
import { ItemRepository } from '../items';

export const playScreen = {
  _map: null,
  _player: null,
  _gameEnded: false,
  _subScreen: null,

  enter: function() {
    // size parameters
    const width = 100,
      height = 48,
      depth = 7;
    // declare tiles and player
    let tiles = new Builder(width, height, depth).getTiles();
    this._player = new Entity(Player);
    // make player start with a dagger
    const dagger = ItemRepository.create('dagger');
    this._player.addItem(dagger);
    this._player.wield(dagger);
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
    let topLeftX = Math.max(0, this._player.getX() - Game.getScreenWidth() / 2);
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
};
