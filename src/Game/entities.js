import Mixins from './mixins';
import Repository from './repository';
import Entity from './entity';

export const Player = {
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
};

export const EntityRepository = new Repository('entities', Entity);

EntityRepository.define('tough guy', {
  name: 'tough guy',
  character: 'E',
  foreground: 'red',
  maxHp: 15,
  defenseValue: 5,
  attackValue: 3,
  mixins: [Mixins.WanderActor, Mixins.Attacker, Mixins.Destructible]
});

EntityRepository.define('bat', {
  name: 'bat',
  character: 'B',
  foreground: 'white',
  maxHp: 5,
  attackValue: 4,
  mixins: [Mixins.WanderActor, Mixins.Attacker, Mixins.Destructible]
});

EntityRepository.define('newt', {
  name: 'newt',
  character: ':',
  foreground: 'yellow',
  maxHp: 3,
  attackValue: 2,
  mixins: [Mixins.WanderActor, Mixins.Attacker, Mixins.Destructible]
});
