export const ROT = window.ROT;

export let Game = {
  _display: null,
  _currentScreen: null,
  _screenWidth: 80,
  _screenHeight: 24,

  init: function() {
    // create display with rot defaults
    this._display = new ROT.Display({
      width: this._screenWidth,
      height: this._screenHeight + 1
    });

    const bindEventToScreen = event => {
      window.addEventListener(event, e => {
        if (this._currentScreen !== null) {
          this._currentScreen.handleInput(event, e);
        }
      });
    };

    // Bind keyboard input events
    bindEventToScreen('keydown');
  },

  // Getters
  getDisplay: function() {
    return this._display;
  },
  getScreenWidth: function() {
    return this._screenWidth;
  },
  getScreenHeight: function() {
    return this._screenHeight;
  },

  refresh: function() {
    // Clear the screen
    this._display.clear();
    // Render the screen
    this._currentScreen.render(this._display);
  },

  switchScreen: function(screen) {
    // If we had a screen before, notify it that we exited
    if (this._currentScreen !== null) {
      this._currentScreen.exit();
    }
    // Clear the display
    this.getDisplay().clear();
    // Update our current screen, notify it we entered and then render it
    this._currentScreen = screen;
    if (!this._currentScreen !== null) {
      this._currentScreen.enter();
      this.refresh();
    }
  }
};
