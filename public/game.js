    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // width and height
        let w = 36, h = 25;

        // Create display, declare and generate map type
        let display = new ROT.Display({width:w, height:h});
        let container = display.getContainer();
        let map = new ROT.Map.Arena(w,h);

        // Add the container to our HTML page
        document.getElementsByClassName("game-container")[0].appendChild(container);
        
        // Draw map on display
        map.create(function(x,y, wall) {
            display.draw(x,y,wall ?"#" : ".")
        });
    }