import Repository from './repository';
import Item from './item';
import ItemMixins from './itemmixins';

export const ItemRepository = new Repository('items', Item);

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

// Weapons
ItemRepository.define(
  'knife',
  {
    name: 'knife',
    character: ')',
    foreground: 'darkgray',
    attackValue: 2,
    wieldable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'dagger',
  {
    name: 'dagger',
    character: ')',
    foreground: 'gray',
    attackValue: 3,
    wieldable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'short sword',
  {
    name: 'short sword',
    character: ')',
    foreground: 'lightgray',
    attackValue: 5,
    wieldable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'war hammer',
  {
    name: 'war hammer',
    character: 'T',
    foreground: 'slategray',
    attackValue: 8,
    wieldable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'long sword',
  {
    name: 'long sword',
    character: '|',
    foreground: 'white',
    attackValue: 12,
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
    character: '/',
    foreground: 'darkgoldenrod',
    attackValue: 7,
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
  'leather armor',
  {
    name: 'leather armor',
    character: '[',
    foreground: 'saddlebrown',
    defenseValue: 3,
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
  'reinforced mail',
  {
    name: 'reinforced mail',
    character: '[',
    foreground: 'lightgoldenrodyellow',
    defenseValue: 5,
    wearable: true,
    mixins: [ItemMixins.Equippable]
  },
  {
    disableRandomCreation: true
  }
);

ItemRepository.define(
  'breastplate',
  {
    name: 'breastplate',
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
