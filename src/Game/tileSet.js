import { Game } from './game';
import * as Screen from './screens';

export const _init = function() {
  // Loads our tileSet into our page to use
  const tileSet = document.createElement('img');
  tileSet.src = require('./tileSet/Floor-Players.png');

  // tileOptions, assigns characters to tiles
  const options = {
    layout: 'tile',
    bg: 'transparent',
    tileWidth: 16,
    tileHeight: 16,
    tileSet: tileSet,
    tileMap: {
      '#': [0, 96],
      '.': [0, 48],
      '@': [336, 0],
      E: [368, 128]
    }
  };

  // Wait for tileSet load
  tileSet.onload = function() {
    // Sets the current Rot.display with options
    Game._display.setOptions(options);
    // Switch to play display and start game engine
    Game.switchScreen(Screen.playScreen);
    Game.startEngine();
  };
};
