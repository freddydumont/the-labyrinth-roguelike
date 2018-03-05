const Geometry = {
  getLine: function(startX, startY, endX, endY) {
    // Bresenham's Line Algorithm
    // Accepts a starting point and end point and
    // return an array of all the points along the line.
    var points = [];
    var dx = Math.abs(endX - startX);
    var dy = Math.abs(endY - startY);
    var sx = startX < endX ? 1 : -1;
    var sy = startY < endY ? 1 : -1;
    var err = dx - dy;
    var e2;

    while (true) {
      points.push({ x: startX, y: startY });
      if (startX === endX && startY === endY) {
        break;
      }
      e2 = err * 2;
      if (e2 > -dx) {
        err -= dy;
        startX += sx;
      }
      if (e2 < dx) {
        err += dx;
        startY += sy;
      }
    }

    return points;
  },

  getCardinal: function(x1, y1, x2, y2) {
    // https://stackoverflow.com/questions/35104991/
    // relative-cardinal-direction-of-two-coordinates
    const directions = {
      6: 'North',
      7: 'Northwest',
      0: 'West',
      1: 'Southwest',
      2: 'South',
      3: 'Southeast',
      4: 'East',
      5: 'Northeast',
    };

    let angle = (Math.atan2(y2 - y1, x2 - x1) + Math.PI) / (Math.PI / 4);
    // round angle for more precision
    return directions[Math.round(angle) % 8];
  },

  getDistance: function(x1, y1, x2, y2) {
    return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
  },
};

export default Geometry;
