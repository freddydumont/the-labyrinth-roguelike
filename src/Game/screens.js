import { ROT, Game } from './game';
import * as Maps from './map';
import * as Messages from './messages';
import Entity from './entity';
import { Player } from './entities';
import Builder from './builder';

// Define our initial start screen
export const startScreen = {
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
        Game.switchScreen(playScreen);
      }
    }
  }
};

// Define our playing screen
export const playScreen = {
  _map: null,
  _player: null,
  _gameEnded: false,

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
    Maps.renderMap.call(this, display);
    Messages.renderMessages.call(this, display);
  },

  handleInput: function(inputType, inputData) {
    // If the game is over, enter will bring the user to the losing screen.
    if (this._gameEnded) {
      if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(loseScreen);
      }
      // Return to make sure the user can't still play
      return;
    }

    if (inputType === 'keydown') {
      // Movement
      if (inputData.keyCode === ROT.VK_LEFT) {
        this.move(-1, 0, 0);
      } else if (inputData.keyCode === ROT.VK_RIGHT) {
        this.move(1, 0, 0);
      } else if (inputData.keyCode === ROT.VK_UP) {
        this.move(0, -1, 0);
      } else if (inputData.keyCode === ROT.VK_DOWN) {
        this.move(0, 1, 0);
      } else {
        // not a valid key
        return;
      }
      // Unlock the engine
      this._map.getEngine().unlock();
    } else if (inputType === 'keypress') {
      let keyChar = String.fromCharCode(inputData.charCode);
      if (keyChar === '>') {
        this.move(0, 0, 1);
      } else if (keyChar === '<') {
        this.move(0, 0, -1);
      } else {
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
  }
};

// Define our winning screen
export const winScreen = {
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
};

// Define our winning screen
export const loseScreen = {
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
};
