import { startScreen } from './startScreen';
import { winScreen } from './winScreen';
import { loseScreen } from './loseScreen';
import { helpScreen } from './helpScreen';
import { gainStatScreen } from './gainStatScreen';
import * as itemListScreens from './itemListScreens';
import { lookScreen } from './targetBasedScreens';

let Screen = {
  startScreen,
  winScreen,
  loseScreen,
  helpScreen,
  gainStatScreen,
  lookScreen,
  ...itemListScreens
};

export default Screen;
