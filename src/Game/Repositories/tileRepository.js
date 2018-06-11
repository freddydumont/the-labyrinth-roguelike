import Repository from './repository';
import Tile from '../tile';

const TileRepository = new Repository('tiles', Tile);

// nullTile will be returned whenever we try to access an out of bounds tiles
TileRepository.define('null', {
  name: 'null',
});

TileRepository.define('floor', {
  name: 'floor',
  character: '.',
  walkable: true,
  description: 'A dungeon floor',
});

TileRepository.define('wall', {
  name: 'wall',
  character: '#',
  foreground: 'lightsteelblue',
  blocksLight: true,
  description: 'A dungeon wall',
});

TileRepository.define('caveWall', {
  name: 'wall',
  character: '#',
  foreground: 'goldenrod',
  blocksLight: true,
  description: 'A cave wall',
});

TileRepository.define('dungeonWall', {
  name: 'wall',
  character: '#',
  foreground: 'teal',
  blocksLight: true,
  description: 'A dungeon wall',
});

TileRepository.define('mazeWall', {
  name: 'mazeWall',
  character: '#',
  foreground: 'rgb(255, 183, 0)',
  blocksLight: true,
  description: 'A maze wall',
});

TileRepository.define('stairsUp', {
  name: 'stairsUp',
  character: '<',
  foreground: 'white',
  walkable: true,
  description: 'A rock staircase leading upwards',
});

TileRepository.define('stairsDown', {
  name: 'stairsDown',
  character: '>',
  foreground: 'white',
  walkable: true,
  description: 'A rock staircase leading downwards',
});

export default TileRepository;
