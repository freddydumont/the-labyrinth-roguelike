import { ROT } from '../game';
/**
 * A repository has a name and a constructor. The constructor is used to create
 * items in the repository.
 */
export default class Repository {
  constructor(name, ctor) {
    this._name = name;
    this._templates = {};
    this._ctor = ctor;
    this._randomTemplates = {};
  }

  // Define a new named template.
  define(name, template, options) {
    this._templates[name] = template;
    // Apply any options
    const disableRandomCreation = options && options['disableRandomCreation'];
    if (!disableRandomCreation) {
      this._randomTemplates[name] = template;
    }
  }

  // Create an object based on a template.
  create(name, extraProperties) {
    if (!this._templates[name]) {
      throw new Error(
        "No template named '" + name + "' in repository '" + this._name + "'"
      );
    }
    // Copy the template
    const template = Object.create(this._templates[name]);
    // Apply any extra properties
    if (extraProperties) {
      for (var key in extraProperties) {
        template[key] = extraProperties[key];
      }
    }
    // Create the object, passing the template as an argument
    return new this._ctor(template);
  }

  // Create an object based on a random template
  createRandom() {
    // Pick a random key and create an object based off of it.
    return this.create(Object.keys(this._randomTemplates).random());
  }

  // Create all objects in this._templates
  createAll() {
    let objects = [];
    const templates = Object.keys(this._templates);
    for (let i = 0; i < templates.length; i++) {
      objects.push(this.create(templates[i]));
    }
    return objects;
  }

  // Create an object based on a random template,
  // checking if object can be spawned on that level
  createRandomOnLevel(level) {
    // Return the result of calling random() on the
    // filtered array of objects returned by createAll
    return this.createAll()
      .filter(object => {
        // try to find level in the object levelRange
        let found = object
          .getLevelRange()
          .find(objectLevel => objectLevel === level);
        return typeof found !== 'undefined';
      })
      .random();
  }

  createFromWeightedValues(level) {
    // create all objects in repo and reduce the array to make an object
    // of weighted values compatible with ROT
    const objects = this.createAll().reduce((levelWeightedValues, object) => {
      // check if object has a weighted value for the level
      let weightedValue = object.getWeightedValueForLevel(level);
      if (weightedValue) {
        // if true, get object name as key, and wv as value, add it to accumulator
        levelWeightedValues[object.getName()] = weightedValue;
      }
      return levelWeightedValues;
    }, {});

    // pick one object (returns the name), create it and return
    return this.create(ROT.RNG.getWeightedValue(objects));
  }
}
