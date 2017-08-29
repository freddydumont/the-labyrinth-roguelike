import Repository from './repository';
import Item from './item';
import ItemMixins from './itemmixins';

export const ItemRepository = new Repository('items', Item);

// Edibles
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
  foreground: 'lightgreen',
  foodValue: 35,
  consumptions: 4,
  mixins: [ItemMixins.Edible]
});

ItemRepository.define(
  'corpse',
  {
    name: 'corpse',
    character: '%',
    foodValue: 75,
    consumptions: 1,
    mixins: [ItemMixins.Edible]
  },
  {
    disableRandomCreation: true
  }
);

// Weapons
ItemRepository.define(
  'dagger',
  {
    name: 'dagger',
    character: ')',
    foreground: 'gray',
    attackValue: 5,
    wieldable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'sword',
  {
    name: 'sword',
    character: ')',
    foreground: 'white',
    attackValue: 10,
    wieldable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'staff',
  {
    name: 'staff',
    character: ')',
    foreground: 'yellow',
    attackValue: 5,
    defenseValue: 3,
    wieldable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

// Wearables
ItemRepository.define(
  'tunic',
  {
    name: 'tunic',
    character: '[',
    foreground: 'green',
    defenseValue: 2,
    wearable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'chainmail',
  {
    name: 'chainmail',
    character: '[',
    foreground: 'white',
    defenseValue: 4,
    wearable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'platemail',
  {
    name: 'platemail',
    character: '[',
    foreground: 'aliceblue',
    defenseValue: 6,
    wearable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

// Other
ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foreground: 'white'
});
