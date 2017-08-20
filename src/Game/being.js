import Entity from './entity';

export default class Being extends Entity {
  constructor(props) {
    super(props);
    this.health = 3;
    this.def = 0;
    this.attack = 1;
  }
}
