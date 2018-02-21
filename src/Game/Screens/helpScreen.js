import { Game } from '../game';
import Screen from './index';

export const helpScreen = {
  render: function(display) {
    let text = 'Help';
    const border = '-------------';
    let y = 0;
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    display.drawText(
      Game.getScreenWidth() / 2 - border.length / 2,
      y++,
      border
    );
    y++;
    display.drawText(
      0,
      y++,
      'You have been tasked to enter the Labyrinth and slay the Minotaur.'
    );
    display.drawText(0, y++, 'Find him and end his tyranny!');
    y += 3;
    display.drawText(0, y++, '[>] to go down a level');
    display.drawText(0, y++, '[<] to go up a level');
    display.drawText(0, y++, '[.] to wait');
    display.drawText(0, y++, '[,] to pick up items');
    display.drawText(0, y++, '[d] to drop items');
    display.drawText(0, y++, '[e] to eat items');
    display.drawText(0, y++, '[w] to wield items');
    display.drawText(0, y++, '[W] to wear items');
    display.drawText(0, y++, '[x] to examine items');
    display.drawText(0, y++, '[t] to throw items');
    display.drawText(0, y++, '[f] to fire ranged weapon');
    display.drawText(0, y++, '[;] to look around you');
    display.drawText(0, y++, '[?] to show this help screen');
    y += 3;
    text = '--- press any key to continue ---';
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
  },

  handleInput: function(inputType, inputData) {
    Screen.playScreen.setSubScreen(null);
  },
};
