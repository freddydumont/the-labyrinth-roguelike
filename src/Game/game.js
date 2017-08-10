import { generateMap } from './map';

export let ROT = window.ROT;
// width and height
ROT.DEFAULT_HEIGHT = 25;
ROT.DEFAULT_WIDTH = 36;

export let Game = {
  display: null,
  engine: null,
  map: {},

  init: function() {
    // create display with rot defaults
    this.display = new ROT.Display();

    // Add the container to our HTML page
    document
      .getElementsByClassName('game-container')[0]
      .appendChild(this.display.getContainer());

    // call map generation function
    generateMap();

    // create scheduler and add beings to it
    let scheduler = new ROT.Scheduler.Simple();
    scheduler.add(this.player, true);
    scheduler.add(this.enemy, true);

    // start the engine with the scheduler
    this.engine = new ROT.Engine(scheduler);
    this.engine.start();
  }
};
