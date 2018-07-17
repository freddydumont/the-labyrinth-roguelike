import { ROT, Game } from '../game';
import Screen from './index';

export const startScreen = {
  enter: function() {},

  exit: function() {},

  render: function(display) {
    // Render our prompt to the screen
    let text = 'The Labyrinth';
    let y = 3;
    display.drawText(
      Game.getScreenWidth() / 2 - text.length / 2,
      y++,
      '%c{rgb(255,183,0)}' + text
    );

    text = [
      'Every nine years, seven Athenian boys and seven Athenian',
      'girls are sent to Crete to be devoured by the Minotaur. ',
      'Your are Theseus. You have volunteered to take the place',
      'of a boy, find the Minotaur in his dungeon and slay him.',
      'If you succeed, you will be remembered.',
    ];
    y = Game.getScreenHeight() / 2 - text.length;
    for (let i = 0; i < text.length; i++) {
      display.drawText(
        Game.getScreenWidth() / 2 - text[i].length / 2,
        y++,
        text[i]
      );
      if (i % 2) {
        y++;
      }
    }

    text = 'Press [Enter] to start!';
    y += 3;
    display.drawText(
      Game.getScreenWidth() / 2 - text.length / 2,
      y,
      '%c{rgb(255,183,0)}' + text
    );
  },

  handleInput: function(inputType, inputData) {
    // When [Enter] is pressed, go to the play screen
    if (inputType === 'keydown') {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(Screen.playScreen);
      }
    }
  },
};
