import Mixins from './mixins';

const Entities = {
  Player: {
    name: 'player',
    character: '@',
    foreground: 'yellow',
    maxHp: 40,
    attackValue: 10,
    sightRadius: 6,
    mixins: [
      Mixins.PlayerActor,
      Mixins.Attacker,
      Mixins.Destructible,
      Mixins.Sight,
      Mixins.MessageRecipient
    ]
  },

  Bat: {
    name: 'bat',
    character: 'B',
    foreground: 'white',
    maxHp: 5,
    attackValue: 4,
    mixins: [Mixins.WanderActor, Mixins.Attacker, Mixins.Destructible]
  },

  Newt: {
    name: 'newt',
    character: ':',
    foreground: 'yellow',
    maxHp: 3,
    attackValue: 2,
    mixins: [Mixins.WanderActor, Mixins.Attacker, Mixins.Destructible]
  },

  ToughGuy: {
    name: 'tough guy',
    character: 'E',
    foreground: 'red',
    maxHp: 15,
    defenseValue: 5,
    attackValue: 3,
    mixins: [Mixins.WanderActor, Mixins.Attacker, Mixins.Destructible]
  }
};

export default Entities;
