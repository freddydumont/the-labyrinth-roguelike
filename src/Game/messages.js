import { vsprintf } from 'sprintf-js';
// see https://github.com/alexei/sprintf.js for formatting options
import Mixins from './mixins';

/**
 * Take at least a recipient entity and a message as arguments,
 * as well as an optional array of parameters to pass to vsprintf
 * which is a function that accepts it's formatting arguments as an array.
 */
export const sendMessage = function(recipient, message, args) {
  // Make sure the recipient can receive the message before doing any work.
  if (recipient.hasMixin(Mixins.MessageRecipient)) {
    // If args were passed, then we format the message, else no formatting is necessary
    if (args) {
      message = vsprintf(message, args);
    }
    recipient.receiveMessage(message);
  }
};

/**
 * This function specifies a location rather than a recipient entity.
 * Sends the message to all entities within a given radius from the location.
 */
export const sendMessageNearby = function(
  map,
  centerX,
  centerY,
  message,
  args
) {
  // If args were passed, then we format the message, else no formatting is necessary
  if (args) {
    message = vsprintf(message, args);
  }
  // Get the nearby entities
  let entities = map.getEntitiesWithinRadius(centerX, centerY, 5);
  // Iterate through nearby entities, sending the message if they can receive it.
  for (let i = 0; i < entities.length; i++) {
    if (entities[i].hasMixin(Mixins.MessageRecipient)) {
      entities[i].receiveMessage(message);
    }
  }
};

/**
 * Render messages in the top left corner of the screen
 * TODO: render messages in a dedicated message box
 */
export const renderMessages = function(display) {
  // Get the messages in the player's queue and render them
  const messages = this._player.getMessages();
  let messageY = 0;
  for (let i = 0; i < messages.length; i++) {
    // Draw each message, adding the number of lines
    messageY += display.drawText(
      0,
      messageY,
      '%c{white}%b{black}' + messages[i]
    );
  }
};
