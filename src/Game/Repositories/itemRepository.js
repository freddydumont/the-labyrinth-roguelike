import { ROT } from '../game';
import Repository from './repository';
import Item from '../item';
import ItemMixins from '../itemmixins';

export const ItemRepository = new Repository('items', Item);
export const GearRepository = new Repository('gear', Item);

// Edibles
ItemRepository.define('fig', {
  name: 'fig',
  character: '%',
  foreground: 'gold',
  foodValue: 100,
  healAmount: 5,
  onGround: true,
  mixins: [ItemMixins.Edible, ItemMixins.Throwable],
});

ItemRepository.define('raisins', {
  name: 'raisins',
  character: '%',
  foreground: 'purple',
  foodValue: 50,
  healAmount: 2,
  onGround: true,
  consumptions: 4,
  mixins: [ItemMixins.Edible, ItemMixins.Throwable],
});

ItemRepository.define(
  'corpse',
  {
    name: 'corpse',
    character: '%',
    foodValue: 75,
    onGround: true,
    consumptions: 1,
    mixins: [ItemMixins.Edible],
  },
  {
    disableRandomCreation: true,
  }
);

// Other
ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foreground: 'white',
  throwableAttackValue: 2,
  mixins: [ItemMixins.Throwable, ItemMixins.Ammo],
});

ItemRepository.define('arrow', {
  name: 'arrow',
  character: '›',
  foreground: 'white',
  count: ROT.RNG.getUniformInt(1, 5),
  mixins: [ItemMixins.Ammo],
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
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
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
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'xiphos',
  {
    name: 'xiphos',
    character: ')',
    foreground: 'lightgray',
    attackValue: 5,
    wieldable: true,
    weightedValues: [0, 20, 25, 15, 10, 0, 0],
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'kopis',
  {
    name: 'kopis',
    character: ')',
    foreground: 'slategray',
    attackValue: 8,
    wieldable: true,
    weightedValues: [0, 0, 5, 10, 20, 15, 0],
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'dory',
  {
    name: 'dory',
    character: '/',
    foreground: 'darkgoldenrod',
    attackValue: 7,
    defenseValue: 3,
    wieldable: true,
    weightedValues: [0, 0, 5, 10, 10, 15, 0],
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'legendary sword',
  {
    name: 'legendary sword',
    character: ')',
    foreground: 'white',
    attackValue: 12,
    wieldable: true,
    weightedValues: [0, 0, 0, 5, 10, 20, 0],
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
  }
);

// Ranged Weapons
GearRepository.define(
  'sling',
  {
    name: 'sling',
    character: '^',
    foreground: 'saddlebrown',
    rangedAttackValue: 3,
    wieldable: true,
    ranged: true,
    ammo: 'rock',
    weightedValues: [50, 30, 15, 10, 0, 0, 0],
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'bow',
  {
    name: 'bow',
    character: '3',
    foreground: 'tan',
    rangedAttackValue: 5,
    wieldable: true,
    ranged: true,
    ammo: 'arrow',
    weightedValues: [0, 20, 25, 15, 10, 0, 0],
    mixins: [ItemMixins.Equippable, ItemMixins.Throwable],
  },
  {
    disableRandomCreation: true,
  }
);

// Wearables
GearRepository.define(
  'tunic',
  {
    name: 'tunic',
    character: '[',
    foreground: 'white',
    defenseValue: 2,
    wearable: true,
    weightedValues: [50, 30, 15, 10, 0, 0, 0],
    mixins: [ItemMixins.Equippable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'linothorax',
  {
    name: 'linothorax',
    character: '[',
    foreground: 'beige',
    defenseValue: 3,
    wearable: true,
    weightedValues: [0, 20, 25, 15, 10, 0, 0],
    mixins: [ItemMixins.Equippable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'reinforced linothorax',
  {
    name: 'reinforced linothorax',
    character: '[',
    foreground: 'lightgrey',
    defenseValue: 4,
    wearable: true,
    weightedValues: [0, 0, 5, 10, 20, 15, 0],
    mixins: [ItemMixins.Equippable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'breastplate',
  {
    name: 'breastplate',
    character: '[',
    foreground: 'silver',
    defenseValue: 5,
    wearable: true,
    weightedValues: [0, 0, 5, 10, 10, 15, 0],
    mixins: [ItemMixins.Equippable],
  },
  {
    disableRandomCreation: true,
  }
);

GearRepository.define(
  'legendary breastplate',
  {
    name: 'legendary breastplate',
    character: '[',
    foreground: 'gold',
    defenseValue: 6,
    wearable: true,
    weightedValues: [0, 0, 0, 5, 10, 20, 0],
    mixins: [ItemMixins.Equippable],
  },
  {
    disableRandomCreation: true,
  }
);
