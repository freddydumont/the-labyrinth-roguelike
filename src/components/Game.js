import React from 'react';
const ROT = window.ROT;

class GameBase extends React.Component {
  constructor(props) {
    super(props);
    this.display = new ROT.Display({
      width: this.props.width,
      height: this.props.height,
      fontSize: 18
    });
    this.map = {};
    this.mapSettings = { floorColor: 'grey' };
    this.h = this.props.height;
    this.w = this.props.width;
    this.engine = null;
  }

  makeFloor() {
    return [' ', 'transparent', this.mapSettings.floorColor];
  }

  generateMap() {
    // if map already generated, reset it
    if (this.map !== {}) this.map = {};
    const map = new ROT.Map.Rogue(this.w, this.h);
    const freeCells = [];

    map.create((x, y, val) => {
      const key = x + ',' + y;

      if (!val) {
        freeCells.push([x, y]);
        this.map[key] = '.';
      } else {
        this.map[key] = '#';
      }
    });
  }

  drawWholeMap = () => {
    for (let key in this.map) {
      let parts = key.split(',');
      let x = parseInt(parts[0]);
      let y = parseInt(parts[1]);
      this.display.draw(x, y, this.map[key]);
    }
  };

  componentWillMount() {
    document.body.appendChild(this.display.getContainer());
    this.generateMap();
    let scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);

    this.drawWholeMap();

    // start the engine with the scheduler
    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  }

  render() {
    return <div className="hudElems" />;
  }
}

export default GameBase;
