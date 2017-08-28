import EntityMixins from './entitymixins';
import Repository from './repository';
import Entity from './entity';

export const Player = {
  name: 'player',
  character: '@',
  foreground: 'yellow',
  maxHp: 40,
  attackValue: 10,
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
  maxHp: 5,
  attackValue: 4,
  speed: 2000,
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
  maxHp: 3,
  attackValue: 2,
  mixins: [
    EntityMixins.TaskActor,
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
  maxHp: 6,
  attackValue: 4,
  sightRadius: 5,
  tasks: ['hunt', 'wander'],
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
    maxHp: 80,
    attackValue: 15,
    defenseValue: 10,
    sightRadius: 8,
    tasks: ['hunt', 'wander'],
    mixins: [
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
