import EntityMixins from './entitymixins';
import Repository from './repository';
import Entity from './entity';

export const Player = {
  name: 'player',
  character: '@',
  foreground: 'yellow',
  maxHp: 50,
  attackValue: 8,
  sightRadius: 6,
  inventorySlots: 22,
  // Max fullness
  maxFullness: 1000,
  // Starting fullness
  fullness: 500,
  // Lose 1 fullness per step
  fullnessDepletionRate: 1,
  mixins: [
    EntityMixins.PlayerActor,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.Sight,
    EntityMixins.InventoryHolder,
    EntityMixins.Equipper,
    EntityMixins.MessageRecipient,
    EntityMixins.FoodConsumer,
    EntityMixins.ExperienceGainer,
    EntityMixins.PlayerStatGainer
  ]
};

export const EntityRepository = new Repository('entities', Entity);

EntityRepository.define('bat', {
  name: 'bat',
  character: 'B',
  foreground: 'white',
  maxHp: 10,
  attackValue: 4,
  speed: 2000,
  levelRange: [0, 1, 2],
  mixins: [
    EntityMixins.TaskActor,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.CorpseDropper,
    EntityMixins.ExperienceGainer,
    EntityMixins.RandomStatGainer
  ]
});

EntityRepository.define('newt', {
  name: 'newt',
  character: ':',
  foreground: 'yellow',
  maxHp: 12,
  attackValue: 5,
  levelRange: [0, 1],
  mixins: [
    EntityMixins.TaskActor,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.CorpseDropper,
    EntityMixins.ExperienceGainer,
    EntityMixins.RandomStatGainer
  ]
});

EntityRepository.define('rat', {
  name: 'rat',
  character: 'r',
  foreground: 'saddlebrown',
  maxHp: 15,
  attackValue: 5,
  tasks: ['hunt', 'wander'],
  levelRange: [0, 1, 2],
  mixins: [
    EntityMixins.TaskActor,
    EntityMixins.Sight,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.CorpseDropper,
    EntityMixins.ExperienceGainer,
    EntityMixins.RandomStatGainer
  ]
});

EntityRepository.define('kobold', {
  name: 'kobold',
  character: 'k',
  foreground: 'brown',
  maxHp: 20,
  attackValue: 7,
  tasks: ['hunt', 'wander'],
  levelRange: [1, 2, 3],
  mixins: [
    EntityMixins.TaskActor,
    EntityMixins.Sight,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.CorpseDropper,
    EntityMixins.ExperienceGainer,
    EntityMixins.RandomStatGainer
  ]
});

EntityRepository.define('goblin', {
  name: 'goblin',
  character: 'g',
  foreground: 'lawngreen',
  maxHp: 25,
  attackValue: 9,
  defenseValue: 2,
  sightRadius: 6,
  tasks: ['hunt', 'wander'],
  levelRange: [2, 3, 4],
  mixins: [
    EntityMixins.TaskActor,
    EntityMixins.Sight,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.CorpseDropper,
    EntityMixins.ExperienceGainer,
    EntityMixins.RandomStatGainer
  ]
});

EntityRepository.define('orc', {
  name: 'orc',
  character: 'O',
  foreground: 'darkgreen',
  maxHp: 40,
  attackValue: 12,
  defenseValue: 5,
  sightRadius: 7,
  tasks: ['hunt', 'wander'],
  levelRange: [4, 5],
  mixins: [
    EntityMixins.TaskActor,
    EntityMixins.Sight,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.CorpseDropper,
    EntityMixins.ExperienceGainer,
    EntityMixins.RandomStatGainer
  ]
});

EntityRepository.define('cyclop', {
  name: 'cyclop',
  character: 'C',
  foreground: 'darkkhaki',
  maxHp: 50,
  attackValue: 15,
  defenseValue: 6,
  sightRadius: 4,
  tasks: ['hunt', 'wander'],
  levelRange: [5],
  mixins: [
    EntityMixins.TaskActor,
    EntityMixins.Sight,
    EntityMixins.Attacker,
    EntityMixins.Destructible,
    EntityMixins.CorpseDropper,
    EntityMixins.ExperienceGainer,
    EntityMixins.RandomStatGainer
  ]
});

EntityRepository.define(
  'minotaur',
  {
    name: 'minotaur',
    character: 'M',
    foreground: 'red',
    maxHp: 100,
    attackValue: 25,
    defenseValue: 10,
    sightRadius: 10,
    tasks: ['hunt', 'wander'],
    levelRange: [6],
    mixins: [
      EntityMixins.BossActor,
      EntityMixins.TaskActor,
      EntityMixins.Sight,
      EntityMixins.Attacker,
      EntityMixins.Destructible,
      EntityMixins.CorpseDropper,
      EntityMixins.ExperienceGainer,
      EntityMixins.RandomStatGainer
    ]
  },
  {
    disableRandomCreation: true
  }
);
