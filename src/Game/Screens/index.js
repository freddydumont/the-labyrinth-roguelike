import { startScreen } from './startScreen';
import { playScreen } from './playScreen';
import { endScreen } from './endScreen';
import { helpScreen } from './helpScreen';
import { gainStatScreen } from './gainStatScreen';
import * as itemListScreens from './itemListScreens';
import * as targetBasedScreens from './targetBasedScreens';

export default {
  startScreen,
  playScreen,
  endScreen,
  helpScreen,
  gainStatScreen,
  ...itemListScreens,
  ...targetBasedScreens,
};
