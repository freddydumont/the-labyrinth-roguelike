import Mixins from './mixins';

const Entities = {
  Player: {
    name: 'player',
    character: '@',
    foreground: 'yellow',
    maxHp: 40,
    attackValue: 10,
    mixins: [
      Mixins.PlayerAct,
      Mixins.PlayerHandleEvent,
      Mixins.EndTurn,
      Mixins.Moveable,
      Mixins.Combat,
      Mixins.newPosition
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
      Mixins.EnemyAct,
      Mixins.newPosition,
      Mixins.Moveable,
      Mixins.Combat
    ]
  }
};

export default Entities;
