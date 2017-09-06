import { ROT, Game } from '../game';
import Screen from './index';

export const startScreen = {
  enter: function() {
    // console.log('Entered start screen.');
  },

  exit: function() {
    // console.log('Exited start screen.');
  },

  render: function(display) {
    // Render our prompt to the screen
    display.drawText(1, 1, '%c{rgb(255,183,0)}The Labyrinth');
    display.drawText(1, 2, 'Press [Enter] to start!');
  },

  handleInput: function(inputType, inputData) {
    // When [Enter] is pressed, go to the play screen
    if (inputType === 'keydown') {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(Screen.playScreen);
      }
    }
  }
};
