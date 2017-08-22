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
