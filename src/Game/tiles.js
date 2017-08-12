import { Game } from './game';
import { generateMap } from './map';

export const _init = function() {
  // loads our tileSet into our page to use
  const tileSet = document.createElement('img');
  tileSet.src = require('./tileSet/Floor.png');

  // tileOptions, assigns characters to tiles
  const options = {
    layout: 'tile',
    bg: 'transparent',
    tileWidth: 48,
    tileHeight: 48,
    tileSet: tileSet,
    tileMap: {
      '#': [0, 0],
      '.': [0, 48],
      '@': [0, 96],
      E: [0, 240]
    },
    width: Game.gameW,
    height: Game.gameH
  };

  // sets the current Rot.display with options
  Game.display.setOptions(options);

  // on tileSet load
  tileSet.onload = function() {
    generateMap();
    Game.startEngine();
  };
};
