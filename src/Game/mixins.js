import { Game } from './game';

const Mixins = {
  // returns true if walkable else false
  Moveable: {
    name: 'Moveable',
    tryMove: (x, y) => {
      var tile = Game._map.getTile(x, y);
      // Check if we can walk on the tile
      // and if so simply walk onto it
      if (tile.isWalkable()) {
        // Update the entity's position
        this._x = x;
        this._y = y;
        return true;
      }
      return false;
    }
  },
  Sight: {
    name: 'Sight',
    groupName: 'Sight',
    init: function(template) {
      this._sightRadius = template['sightRadius'] || 5;
    },
    getSightRadius: function() {
      return this._sightRadius;
    }
  }
};

export default Mixins;
