import { ROT, Game } from './game';
import * as Messages from './messages';
import Screen from './Screens/index';
import { ItemRepository } from './items';

const EntityMixins = {
  BossActor: {
    name: 'BossActor',
    groupName: 'Actor',
    listeners: {
      onDeath: function(attacker) {
        // Switch to win screen when killed!
        Game.switchScreen(Screen.winScreen);
      }
    }
  },

  Equipper: {
    name: 'Equipper',
    init: function(template) {
      this._weapon = null;
      this._armor = null;
    },
    wield: function(item) {
      this._weapon = item;
    },
    unwield: function() {
      this._weapon = null;
    },
    wear: function(item) {
      this._armor = item;
    },
    takeOff: function() {
      this._armor = null;
    },
    getWeapon: function() {
      return this._weapon;
    },
    getArmor: function() {
      return this._armor;
    },
    unequip: function(item) {
      // Helper function to be called before getting rid of an item.
      if (this._weapon === item) {
        this.unwield();
      }
      if (this._armor === item) {
        this.takeOff();
      }
    }
  },

  CorpseDropper: {
    name: 'CorpseDropper',

    init: function(template) {
      // Chance of dropping a cropse (out of 100).
      this._corpseDropRate = template['corpseDropRate'] || 100;
    },

    listeners: {
      onDeath: function(attacker) {
        // Check if we should drop a corpse.
        if (Math.round(Math.random() * 100) <= this._corpseDropRate) {
          // Create a new corpse item and drop it.
          this._map.addItem(
            this.getX(),
            this.getY(),
            this.getZ(),
            ItemRepository.create('corpse', {
              name: this._name + ' corpse',
              foreground: this._foreground
            })
          );
        }
      }
    }
  },

  FoodConsumer: {
    // Handles fullness meter of player.
    name: 'FoodConsumer',
    init: function(template) {
      this._maxFullness = template['maxFullness'] || 1000;
      // Start halfway to max fullness if no default value
      this._fullness = template['fullness'] || this._maxFullness / 2;
      // Number of points to decrease fullness by every turn.
      this._fullnessDepletionRate = template['fullnessDepletionRate'] || 1;
    },
    addTurnHunger: function() {
      // Remove the standard depletion points
      this.modifyFullnessBy(-this._fullnessDepletionRate);
    },
    modifyFullnessBy: function(points) {
      if (this._fullness <= 0) {
        const currentHP = this.getHp();
        if (currentHP <= 0) {
          this.kill('You have died of starvation!');
        } else {
          Messages.sendMessage(this, "You're losing health to starvation!");
          this.setHp(currentHP - 1);
        }
      } else if (this._fullness > this._maxFullness) {
        this.kill('You choke and die!');
      } else {
        this._fullness = this._fullness + points;
      }
    },
    getHungerState: function() {
      // Fullness points per percent of max fullness
      const perPercent = this._maxFullness / 100;
      const hungerMeter = `${Math.floor(this._fullness / 10)}/${this
        ._maxFullness / 10}`;
      let hungerMsg, hungerColor;
      // 10% of max fullness or less = starving
      if (this._fullness <= perPercent * 10) {
        hungerColor = '%c{red}';
        hungerMsg = 'Starving';
        // 30% of max fullness or less = hungry
      } else if (this._fullness <= perPercent * 30) {
        hungerColor = '%c{orange}';
        hungerMsg = 'Hungry';
        // 90% of max fullness or more = oversatiated
      } else if (this._fullness >= perPercent * 90) {
        hungerColor = '%c{lime}';
        hungerMsg = 'Oversatiated';
        // 70% of max fullness or more = full
      } else if (this._fullness >= perPercent * 70) {
        hungerColor = '%c{lightgreen}';
        hungerMsg = 'Full';
        // Anything else = not hungry`
      } else {
        hungerColor = '%c{yellow}';
        hungerMsg = 'Not Hungry';
      }
      return [hungerColor, `${hungerMsg} ${hungerMeter}`];
    }
  },

  /**
     * Adds an internal array of messages and provide a method for receiving a message,
     * as well methods for fetching and clearing the messages.
     */
  MessageRecipient: {
    name: 'MessageRecipient',
    init: function(props) {
      this._messages = [];
    },
    receiveMessage: function(message) {
      this._messages.push(message);
    },
    getMessages: function() {
      return this._messages;
    },
    clearMessages: function() {
      this._messages = [];
    }
  },

  // This mixin signifies an entity can take damage and be destroyed
  Destructible: {
    name: 'Destructible',

    listeners: {
      onGainLevel: function() {
        // Heal the entity.
        this.setHp(this.getMaxHp());
      },
      details: function() {
        return [
          { key: 'defense', value: this.getDefenseValue() },
          { key: 'hp', value: this.getHp() }
        ];
      }
    },

    init: function(props) {
      this._maxHp = props['maxHp'] || 10;
      // We allow taking in health from the props incase we want
      // the entity to start with a different amount of HP than the
      // max specified.
      this._hp = props['hp'] || this._maxHp;
      this._defenseValue = props['defenseValue'] || 0;
    },

    getDefenseValue: function() {
      let modifier = 0;
      // If we can equip items, then have to take into
      // consideration weapon and armor
      if (this.hasMixin(EntityMixins.Equipper)) {
        if (this.getWeapon()) {
          modifier += this.getWeapon().getDefenseValue();
        }
        if (this.getArmor()) {
          modifier += this.getArmor().getDefenseValue();
        }
      }
      return this._defenseValue + modifier;
    },

    increaseDefenseValue: function(value = 2) {
      // Add to the defense value. Default increse is 2.
      this._defenseValue += value;
      Messages.sendMessage(this, 'You look tougher!');
    },

    getHp: function() {
      return this._hp;
    },

    getMaxHp: function() {
      return this._maxHp;
    },

    setHp: function(hp) {
      this._hp = hp;
    },

    increaseMaxHp: function(value = 10) {
      // Add to both max HP and HP. Default increase is 10.
      this._maxHp += value;
      this._hp += value;
      Messages.sendMessage(this, 'You look healthier!');
    },

    takeDamage: function(attacker, damage) {
      this._hp -= damage;
      // If have 0 or less HP, then remove ourseles from the map
      if (this._hp <= 0) {
        Messages.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
        // Raise events
        this.raiseEvent('onDeath', attacker);
        attacker.raiseEvent('onKill', this);
        this.kill();
      }
    }
  },

  // This signifies our entity can attack basic destructible enities
  Attacker: {
    name: 'Attacker',
    groupName: 'Attacker',

    init: function(props) {
      this._attackValue = props['attackValue'] || 1;
    },
    listeners: {
      details: function() {
        return [{ key: 'attack', value: this.getAttackValue() }];
      }
    },

    getAttackValue: function() {
      let modifier = 0;
      // If we can equip items, then have to take into
      // consideration weapon and armor
      if (this.hasMixin(EntityMixins.Equipper)) {
        if (this.getWeapon()) {
          modifier += this.getWeapon().getAttackValue();
        }
        if (this.getArmor()) {
          modifier += this.getArmor().getAttackValue();
        }
      }
      return this._attackValue + modifier;
    },

    increaseAttackValue: function(value = 2) {
      // Add to the attack value. Default increase is 2.
      this._attackValue += value;
      Messages.sendMessage(this, 'You look stronger!');
    },

    attack: function(target) {
      // If the target is destructible, calculate the damage
      // based on attack and defense value
      if (target.hasMixin('Destructible')) {
        let attack = this.getAttackValue();
        let defense = target.getDefenseValue();
        let max = Math.max(0, attack - defense);
        let damage = 1 + Math.floor(Math.random() * max);

        Messages.sendMessage(this, 'You strike the %s for %d damage!', [
          target.getName(),
          damage
        ]);
        Messages.sendMessage(target, 'The %s strikes you for %d damage!', [
          this.getName(),
          damage
        ]);

        target.takeDamage(this, damage);
      }
    }
  },

  // Player Specific Mixins
  PlayerActor: {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
      if (this._acting) {
        return;
      }
      this._acting = true;
      this.addTurnHunger();
      // Detect if the game is over
      if (!this.isAlive()) {
        Screen.playScreen.setGameEnded(true);
        // Send a last message to the player
        Messages.sendMessage(this, 'Press [Enter] to continue!');
      }
      this._acting = false;
      // Re-render the screen
      Game.refresh();
      // Lock the engine and wait asynchronously
      // for the player to press a key.
      this.getMap().getEngine().lock();
      // Clear the message queue
      this.clearMessages();
    }
  },

  /**
   * Task-based actor mixin.
   * Defines a set of tasks in order of priority (eg. hunt, then wander).
   * 
   * The mixin goes through each task and finds the first task that can be done
   * that turn (eg. hunt cannot be done if the player is not in sight).
   * 
   * Tasks are passed in the entity template as an array of strings,
   * and by default all entities simply wander.
   */
  TaskActor: {
    name: 'TaskActor',
    groupName: 'Actor',

    init: function(template) {
      // Load tasks, default is wander
      this._tasks = template['tasks'] || ['wander'];
    },

    act: function() {
      // Iterate through all tasks
      for (let i = 0; i < this._tasks.length; i++) {
        if (this.canDoTask(this._tasks[i])) {
          // If the task can be performed, execute the function for it.
          this[this._tasks[i]]();
          return;
        }
      }
    },

    canDoTask: function(task) {
      if (task === 'hunt') {
        return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
      } else if (task === 'wander') {
        return true;
      } else {
        throw new Error('Tried to perform undefined task ' + task);
      }
    },

    hunt: function() {
      const player = this.getMap().getPlayer();

      // If adjacent to the player, then attack instead of hunting.
      const offsets =
        Math.abs(player.getX() - this.getX()) +
        Math.abs(player.getY() - this.getY());
      if (offsets === 1) {
        if (this.hasMixin('Attacker')) {
          this.attack(player);
          return;
        }
      }

      // Generate the path and move to the first tile.
      const z = this.getZ();
      const path = new ROT.Path.AStar(
        player.getX(),
        player.getY(),
        (x, y) => {
          // If an entity is present at the tile, can't move there.
          const entity = this.getMap().getEntityAt(x, y, z);
          if (entity && entity !== player && entity !== this) {
            return false;
          }
          return this.getMap().getTile(x, y, z).isWalkable();
        },
        { topology: 4 }
      );
      // Once we've gotten the path, we want to move to the second cell that is
      // passed in the callback (the first is the entity's strting point)
      let count = 0;
      path.compute(this.getX(), this.getY(), (x, y) => {
        if (count === 1) {
          this.tryMove(x, y, z);
        }
        count++;
      });
    },

    wander: function() {
      // Flip coin to determine if moving by 1 in the positive or negative direction
      const moveOffset = Math.round(Math.random()) === 1 ? 1 : -1;
      // Flip coin to determine if moving in x direction or y direction
      if (Math.round(Math.random()) === 1) {
        this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
      } else {
        this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
      }
    }
  },

  // This signifies our entity posseses a field of vision of a given radius.
  Sight: {
    name: 'Sight',
    groupName: 'Sight',

    init: function(template) {
      this._sightRadius = template['sightRadius'] || 5;
    },

    getSightRadius: function() {
      return this._sightRadius;
    },

    increaseSightRadius: function(value = 1) {
      // Add to sight radius. Default increase is 1.
      this._sightRadius += value;
      Messages.sendMessage(this, 'You are more aware of your surroundings!');
    },

    // Allow an entity to check if it can see another entity
    canSee: function(entity) {
      // If not on the same map or on different floors, then exit early
      if (
        !entity ||
        this._map !== entity.getMap() ||
        this._z !== entity.getZ()
      ) {
        return false;
      }

      const otherX = entity.getX();
      const otherY = entity.getY();

      // If we're not in a square field of view, then we won't be in a real
      // field of view either.
      if (
        (otherX - this._x) * (otherX - this._x) +
          (otherY - this._y) * (otherY - this._y) >
        this._sightRadius * this._sightRadius
      ) {
        return false;
      }

      // Compute the FOV and check if the coordinates are in there.
      let found = false;
      this.getMap()
        .getFov(this.getZ())
        .compute(this.getX(), this.getY(), this.getSightRadius(), function(
          x,
          y,
          radius,
          visibility
        ) {
          if (x === otherX && y === otherY) {
            found = true;
          }
        });
      return found;
    }
  },

  InventoryHolder: {
    name: 'InventoryHolder',
    init: function(template) {
      // Default to 10 inventory slots.
      let inventorySlots = template['inventorySlots'] || 10;
      // Set up an empty inventory.
      this._items = new Array(inventorySlots);
    },

    getItems: function() {
      // filter the items array and return false if empty
      if (
        this._items.filter(item => {
          return item;
        }).length === 0
      ) {
        return false;
      } else {
        return this._items;
      }
    },

    getItem: function(i) {
      return this._items[i];
    },

    addItem: function(item) {
      // Try to find a slot, returning true only if we could add the item.
      for (let i = 0; i < this._items.length; i++) {
        if (!this._items[i]) {
          this._items[i] = item;
          return true;
        }
      }
      return false;
    },

    removeItem: function(i) {
      // If we can equip items, then make sure we unequip the item we are removing.
      if (this._items[i] && this.hasMixin(EntityMixins.Equipper)) {
        this.unequip(this._items[i]);
      }
      // Simply clear the inventory slot.
      this._items[i] = null;
    },

    canAddItem: function() {
      // Check if we have an empty slot.
      for (let i = 0; i < this._items.length; i++) {
        if (!this._items[i]) {
          return true;
        }
      }
      return false;
    },

    /**
    * Allows the user to pick up items from the map, where indices is
    * the indices for the array returned by map.getItemsAt
    */
    pickupItems: function(indices) {
      let mapItems = this._map.getItemsAt(
        this.getX(),
        this.getY(),
        this.getZ()
      );
      let added = 0;
      // Iterate through all indices.
      for (let i = 0; i < indices.length; i++) {
        // Try to add the item. If our inventory is not full, then splice the
        // item out of the list of items. In order to fetch the right item, we
        // have to offset the number of items already added.
        if (this.addItem(mapItems[indices[i] - added])) {
          mapItems.splice(indices[i] - added, 1);
          added++;
        } else {
          // Inventory is full
          break;
        }
      }
      // Update the map items
      this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
      // Return true only if we added all items
      return added === indices.length;
    },

    dropItem: function(i) {
      // Drops an item to the current map tile
      if (this._items[i]) {
        if (this._map) {
          this._map.addItem(
            this.getX(),
            this.getY(),
            this.getZ(),
            this._items[i]
          );
        }
        this.removeItem(i);
      }
    }
  },

  ExperienceGainer: {
    name: 'ExperienceGainer',

    listeners: {
      onKill: function(victim) {
        let exp = victim.getMaxHp() + victim.getDefenseValue();
        if (victim.hasMixin('Attacker')) {
          exp += victim.getAttackValue();
        }
        // Account for level differences
        if (victim.hasMixin('ExperienceGainer')) {
          exp -= (this.getLevel() - victim.getLevel()) * 3;
        }
        // Only give experience if more than 0.
        if (exp > 0) {
          this.giveExperience(exp);
        }
      },
      details: function() {
        return [{ key: 'level', value: this.getLevel() }];
      }
    },

    init: function(template) {
      this._level = template['level'] || 1;
      this._experience = template['experience'] || 0;
      this._statPointsPerLevel = template['statPointsPerLevel'] || 1;
      this._statPoints = 0;

      // Determine what stats can be levelled up.
      this._statOptions = [];

      if (this.hasMixin('Attacker')) {
        this._statOptions.push([
          'Increase attack value',
          this.increaseAttackValue
        ]);
      }

      if (this.hasMixin('Destructible')) {
        this._statOptions.push([
          'Increase defense value',
          this.increaseDefenseValue
        ]);
        this._statOptions.push(['Increase max health', this.increaseMaxHp]);
      }

      if (this.hasMixin('Sight')) {
        this._statOptions.push([
          'Increase sight range',
          this.increaseSightRadius
        ]);
      }
    },

    getLevel: function() {
      return this._level;
    },
    getExperience: function() {
      return this._experience;
    },
    getNextLevelExperience: function() {
      return this._level * this._level * 10;
    },
    getStatPoints: function() {
      return this._statPoints;
    },
    setStatPoints: function(statPoints) {
      this._statPoints = statPoints;
    },
    getStatOptions: function() {
      return this._statOptions;
    },

    giveExperience: function(points) {
      // currently unused
      //let statPointsGained = 0;
      let levelsGained = 0;
      // Loop until we've allocated all points.
      while (points > 0) {
        // Check if adding in the points will surpass the level threshold.
        if (this._experience + points >= this.getNextLevelExperience()) {
          // Fill our experience till the next threshold.
          let usedPoints = this.getNextLevelExperience() - this._experience;
          points -= usedPoints;
          this._experience += usedPoints;
          // Level up our entity!
          this._level++;
          levelsGained++;
          this._statPoints += this._statPointsPerLevel;
          // currently unused
          //statPointsGained += this._statPointsPerLevel;
        } else {
          // Simple case - just give the experience.
          this._experience += points;
          points = 0;
        }
      }
      // Check if we gained at least one level.
      if (levelsGained > 0) {
        Messages.sendMessage(this, 'You advance to level %d.', [this._level]);
        this.raiseEvent('onGainLevel');
      }
    }
  },

  RandomStatGainer: {
    name: 'RandomStatGainer',
    groupName: 'StatGainer',

    listeners: {
      onGainLevel: function() {
        const statOptions = this.getStatOptions();
        // Randomly select a stat option and execute the callback for each stat point.
        while (this.getStatPoints() > 0) {
          // Call the stat increasing function with this as the context.
          statOptions.random()[1].call(this);
          this.setStatPoints(this.getStatPoints() - 1);
        }
      }
    }
  },

  PlayerStatGainer: {
    name: 'PlayerStatGainer',
    groupName: 'StatGainer',

    listeners: {
      onGainLevel: function() {
        // Setup the gain stat screen and show it.
        Screen.gainStatScreen.setup(this);
        Screen.playScreen.setSubScreen(Screen.gainStatScreen);
      }
    }
  }
};

export default EntityMixins;
