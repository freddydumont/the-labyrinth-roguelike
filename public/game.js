// Check if rot.js can work on this browser
if (!ROT.isSupported()) {
    alert("The rot.js library isn't supported by your browser.");
} else {
    // width and height
    let w = 36, h = 25;

    // Create display, declare and generate map type
    let display = new ROT.Display({ width: w, height: h });
    let container = display.getContainer();
    let map = new ROT.Map.Arena(w, h);

    // store empty cells as array of arrays [[x1,y1],[x2,y2],...]
    let freeCells = [];
    let player = null;

    // Add the container to our HTML page
    document.getElementsByClassName("game-container")[0].appendChild(container);

    // Draw map on display
    let Player = function (x, y) {
        this._x = x;
        this._y = y;
        this.draw();
    }
    Player.prototype.draw = function () {
        display.draw(this._x, this._y, "@", "#ff0")
    }
    let createPlayer = function (freeCells) {
        // random a position for Player to spawn in
        let index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        let x = key[0];
        let y = key[1];
        this.player = new Player(x, y);
    }

    let generateMap = function () {
        map.create(function (x, y, wall) {
            if (!wall) {
                // store empty cells as array of arrays
                freeCells.push([x, y]);
            }
            display.draw(x, y, wall ? "#" : ".")
        });
        createPlayer(freeCells)
    }
    generateMap();


}