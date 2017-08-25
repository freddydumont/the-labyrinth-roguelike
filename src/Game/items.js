import Repository from './repository';
import Item from './item';
import ItemMixins from './itemmixins';

export const ItemRepository = new Repository('items', Item);

ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foreground: 'white'
});
ItemRepository.define('apple', {
  name: 'apple',
  character: '%',
  foreground: 'red',
  foodValue: 50,
  mixins: [ItemMixins.Edible]
});

ItemRepository.define('melon', {
  name: 'melon',
  character: '%',
  foreground: 'brightGreen',
  foodValue: 35,
  consumptions: 4,
  mixins: [ItemMixins.Edible]
});
