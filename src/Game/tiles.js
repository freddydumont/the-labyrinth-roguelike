import { Game } from './game';
import { generateMap } from './map';

export const _init = function() {
  // loads our tileSet into our page to use
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
      '#': [0, 0],
      '.': [0, 48],
      '@': [336, 0],
      E: [368, 128],
      ' ': [48, 48]
    }
  };

  // sets the current Rot.display with options
  Game.display.setOptions(options);

  // wait for tileSet load
  tileSet.onload = function() {
    generateMap();
    Game.startEngine();
  };
};
