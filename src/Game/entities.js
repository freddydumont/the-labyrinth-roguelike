import Mixins from './mixins';

const Entities = {
  Player: {
    name: 'player',
    character: '@',
    foreground: 'yellow',
    maxHp: 40,
    attackValue: 10,
    mixins: [
      Mixins.PlayerActor,
      Mixins.Moveable,
      Mixins.Attacker,
      Mixins.Destructible
    ]
  },

  Enemy: {
    name: 'enemy',
    character: 'E',
    foreground: 'red',
    maxHp: 15,
    defenseValue: 5,
    attackValue: 3,
    mixins: [
      Mixins.EnemyActor,
      Mixins.Moveable,
      Mixins.Attacker,
      Mixins.Destructible
    ]
  }
};

export default Entities;
