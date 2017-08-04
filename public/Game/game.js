// width and height
ROT.DEFAULT_HEIGHT = 25;
ROT.DEFAULT_WIDTH = 36;

let Game = {
    display: null,

    init: function () {
        // create display with rot defaults
        this.display = new ROT.Display();

        // Add the container to our HTML page
        document.getElementsByClassName("game-container")[0].appendChild(this.display.getContainer());
        // call map generation function
        this.generateMap();
    },
};

window.onload = function () {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();
    }
}