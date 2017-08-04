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

// Initialize Player
Game.player = null;
let Player = function (x, y) {
    this._x = x;
    this._y = y;
    this.draw();
}

Player.prototype.draw = function () {
    Game.display.draw(this._x, this._y, "@", "#ff0")
}

Game.createPlayer = function (freeCells) {
    // random a position for Player to spawn in
    let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    var key = freeCells.splice(index, 1)[0];
    let x = key[0];
    let y = key[1];
    this.player = new Player(x, y);
}

window.onload = function () {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();
    }
}