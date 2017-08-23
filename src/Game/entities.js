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

  Enemy: {
    name: 'enemy',
    character: 'E',
    foreground: 'red',
    maxHp: 15,
    defenseValue: 5,
    attackValue: 3,
    mixins: [Mixins.EnemyActor, Mixins.Attacker, Mixins.Destructible]
  }
};

export default Entities;
