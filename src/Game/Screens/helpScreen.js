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
    text = 'You have been tasked to enter the Labyrinth and slay the Minotaur.';
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    text = 'Find him and end his tyranny!';
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
    y += 2;
    display.drawText(1, y++, '[>] to go down a level');
    display.drawText(1, y++, '[<] to go up a level');
    display.drawText(1, y++, '[.] to wait');
    display.drawText(1, y++, '[,] to pick up items');
    display.drawText(1, y++, '[d] to drop items');
    display.drawText(1, y++, '[e] to eat items');
    display.drawText(1, y++, '[w] to wield items');
    display.drawText(1, y++, '[W] to wear items');
    display.drawText(1, y++, '[x] to examine items');
    display.drawText(1, y++, '[t] to throw items');
    display.drawText(1, y++, '[f] to fire ranged weapon');
    display.drawText(1, y++, '[;] to look around you');
    display.drawText(1, y++, '[?] to show this help screen');
    y += 2;
    text = '--- press any key to continue ---';
    display.drawText(Game.getScreenWidth() / 2 - text.length / 2, y++, text);
  },

  handleInput: function(inputType, inputData) {
    Screen.playScreen.setSubScreen(null);
  },
};
