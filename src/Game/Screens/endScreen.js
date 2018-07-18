import { ROT, Game } from '../game';
import Screen from './index';

export const endScreen = {
  BOSS_BONUS: 500,
  YOUTH_BONUS: 100,

  enter: function() {
    const { playScreen } = Screen;
    this.win = playScreen.getPlayer().getHasWon();
    this.youths = playScreen.getPlayer().getMap().getRemainingYouths();
    this.baseScore = playScreen.getPlayer().getExperience();
    this.weapon = playScreen.getPlayer().getWeapon()
      ? playScreen.getPlayer().getWeapon().getAttackValue() +
        playScreen.getPlayer().getWeapon().getDefenseValue()
      : 0;
    this.armor = playScreen.getPlayer().getArmor()
      ? playScreen.getPlayer().getArmor().getDefenseValue()
      : 0;

    const bonus = this.win
      ? this.youths * this.YOUTH_BONUS + this.BOSS_BONUS
      : 0;

    this.score = this.baseScore + this.weapon + this.armor + bonus;
  },

  exit: function() {},

  render: function(display) {
    let text = `You have ${this.win ? 'won!' : 'lost.'}`;
    let color = `%c{${this.win ? 'rgb(255,183,0)' : 'crimson'}}`;
    let y = 3;
    display.drawText(
      Game.getScreenWidth() / 2 - text.length / 2,
      y++,
      color + text
    );

    y += 3;
    text = [
      this.win
        ? `You have slain the minotaur with ${this
            .youths} Athenian youths remaining.`
        : 'You have died.',
      `Your score is: ${this.score}.`,
    ];
    for (let i = 0; i < text.length; i++) {
      display.drawText(
        Game.getScreenWidth() / 2 - text[i].length / 2,
        y++,
        text[i]
      );
      y++;
    }

    y += 2;
    text = 'Press [Enter] to go back to main menu.';
    display.drawText(
      Game.getScreenWidth() / 2 - text.length / 2,
      y++,
      color + text
    );
  },

  handleInput: function(inputType, inputData) {
    // When [Enter] is pressed, go to the play screen
    if (inputType === 'keydown') {
      if (inputData.keyCode === ROT.VK_RETURN) {
        Game.switchScreen(Screen.startScreen);
      }
    }
  },
};
