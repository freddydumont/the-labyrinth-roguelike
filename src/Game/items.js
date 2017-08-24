import Repository from './repository';
import Item from './item';

export const ItemRepository = new Repository('items', Item);

ItemRepository.define('apple', {
  name: 'apple',
  character: '%',
  foreground: 'red'
});

ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foreground: 'white'
});
