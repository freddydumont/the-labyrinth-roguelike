import Repository from './repository';
import Item from './item';
import ItemMixins from './itemmixins';

export const ItemRepository = new Repository('items', Item);
export const GearRepository = new Repository('gear', Item);

// Edibles
ItemRepository.define('apple', {
  name: 'apple',
  character: '%',
  foreground: 'red',
  foodValue: 100,
  mixins: [ItemMixins.Edible]
});

ItemRepository.define('melon', {
  name: 'melon',
  character: '%',
  foreground: 'lightgreen',
  foodValue: 50,
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

// Other
ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foreground: 'white'
});

// Weapons
GearRepository.define(
  'knife',
  {
    name: 'knife',
    character: ')',
    foreground: 'darkgray',
    attackValue: 2,
    wieldable: true,
    weightedValues: [0, 0, 0, 0, 0, 0, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'dagger',
  {
    name: 'dagger',
    character: ')',
    foreground: 'gray',
    attackValue: 3,
    wieldable: true,
    weightedValues: [50, 30, 15, 10, 0, 0, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'short sword',
  {
    name: 'short sword',
    character: ')',
    foreground: 'lightgray',
    attackValue: 5,
    wieldable: true,
    weightedValues: [0, 20, 25, 15, 10, 0, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'war hammer',
  {
    name: 'war hammer',
    character: 'T',
    foreground: 'slategray',
    attackValue: 8,
    wieldable: true,
    weightedValues: [0, 0, 5, 10, 20, 15, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'staff',
  {
    name: 'staff',
    character: '/',
    foreground: 'darkgoldenrod',
    attackValue: 7,
    defenseValue: 3,
    wieldable: true,
    weightedValues: [0, 0, 5, 10, 10, 15, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'long sword',
  {
    name: 'long sword',
    character: '|',
    foreground: 'white',
    attackValue: 12,
    wieldable: true,
    weightedValues: [0, 0, 0, 5, 10, 20, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

// Wearables
GearRepository.define(
  'tunic',
  {
    name: 'tunic',
    character: '[',
    foreground: 'green',
    defenseValue: 2,
    wearable: true,
    weightedValues: [50, 30, 15, 10, 0, 0, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'leather armor',
  {
    name: 'leather armor',
    character: '[',
    foreground: 'saddlebrown',
    defenseValue: 3,
    wearable: true,
    weightedValues: [0, 20, 25, 15, 10, 0, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'chainmail',
  {
    name: 'chainmail',
    character: '[',
    foreground: 'white',
    defenseValue: 4,
    wearable: true,
    weightedValues: [0, 0, 5, 10, 20, 15, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'reinforced mail',
  {
    name: 'reinforced mail',
    character: '[',
    foreground: 'lightgoldenrodyellow',
    defenseValue: 5,
    wearable: true,
    weightedValues: [0, 0, 5, 10, 10, 15, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

GearRepository.define(
  'breastplate',
  {
    name: 'breastplate',
    character: '[',
    foreground: 'aliceblue',
    defenseValue: 6,
    wearable: true,
    weightedValues: [0, 0, 0, 5, 10, 20, 0],
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);
