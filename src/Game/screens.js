import { ROT, Game } from './game';
import Map, { generateMap, renderMap } from './map';
import * as Messages from './messages';
import Entity from './entity';
import Entities from './entities';

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

  enter: function() {
    console.log('Entered play screen.');
    let map = generateMap(80, 24);
    // Create our map from the tiles and player
    this._player = new Entity(Entities.Player);
    this._map = new Map(map, this._player);
    // Start the map's engine
    this._map.getEngine().start();
  },

  exit: function() {
    console.log('Exited play screen.');
  },

  render: function(display) {
    renderMap.call(this, display);
    Messages.renderMessages.call(this, display);
  },

  handleInput: function(inputType, inputData) {
    if (inputType === 'keydown') {
      // Movement
      if (inputData.keyCode === ROT.VK_LEFT) {
        this.move(-1, 0);
      } else if (inputData.keyCode === ROT.VK_RIGHT) {
        this.move(1, 0);
      } else if (inputData.keyCode === ROT.VK_UP) {
        this.move(0, -1);
      } else if (inputData.keyCode === ROT.VK_DOWN) {
        this.move(0, 1);
      }
      // Unlock the engine
      this._map.getEngine().unlock();
    }
  },

  move: function(dX, dY) {
    let newX = this._player.getX() + dX;
    let newY = this._player.getY() + dY;
    // Try to move to the new cell
    this._player.tryMove(newX, newY, this._map);
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
  },
  handleInput: function(inputType, inputData) {
    return;
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
  },
  handleInput: function(inputType, inputData) {
    return;
  }
};
