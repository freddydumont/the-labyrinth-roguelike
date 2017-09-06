export const loseScreen = {
  enter: function() {
    // console.log('Entered lose screen.');
  },

  exit: function() {
    // console.log('Exited lose screen.');
  },

  render: function(display) {
    // Render our prompt to the screen
    for (let i = 0; i < 22; i++) {
      display.drawText(2, i + 1, '%b{red}You lose! :(');
    }
  },

  handleInput: function(inputType, inputData) {
    // nothing to do here
  }
};
