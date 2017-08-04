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

// declare map
Game.map = {};
Game.generateMap = function () {
    // generate map type
    let arena = new ROT.Map.Arena();

    // store empty cells as array of arrays [[x1,y1],[x2,y2],...]
    let freeCells = [];

    // create map
    mapCallback = function (x, y, wall) {
        if (!wall) {
            // store empty cells as array of arrays
            freeCells.push([x, y]);
        }
        this.display.draw(x, y, wall ? "#" : ".")
    }
    arena.create(mapCallback.bind(this));

    // call draw function
    this.drawWholeMap();

    // call function to display player on a free cell
    this.createPlayer(freeCells);
}

// iterate through all the floor tiles and draw their visual representation
Game.drawWholeMap = function () {
    for (let key in this.map) {
        let parts = key.split(",");
        let x = parseInt(parts[0]);
        let y = parseInt(parts[1]);
        this.display.draw(x, y, this.map[key]);
    }
}

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