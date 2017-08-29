import { ROT } from '../game';

export const winScreen = {
  enter: function() {
    console.log('Entered win screen.');
  },

  exit: function() {
    console.log('Exited win screen.');
  },

  render: function(display) {
    // Render our prompt to the screen
    for (let i = 0; i < 22; i++) {
      // Generate random background colors
      const r = Math.round(Math.random() * 255);
      const g = Math.round(Math.random() * 255);
      const b = Math.round(Math.random() * 255);
      const background = ROT.Color.toRGB([r, g, b]);
      display.drawText(2, i + 1, '%b{' + background + '}You win!');
    }
  },

  handleInput: function(inputType, inputData) {
    // nothing to do here
  }
};
