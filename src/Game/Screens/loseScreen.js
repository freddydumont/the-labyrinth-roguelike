export const loseScreen = {
  enter: function() {},

  exit: function() {},

  render: function(display) {
    // TODO: write how player lost and 'press something to continue'
    // Render our prompt to the screen
    for (let i = 0; i < 22; i++) {
      display.drawText(2, i + 1, '%b{red}You lose! :(');
    }
  },

  handleInput: function(inputType, inputData) {
    // TODO: handle game restart
  }
};
