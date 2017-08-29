import { startScreen } from './startScreen';
import { winScreen } from './winScreen';
import { loseScreen } from './loseScreen';
import { helpScreen } from './helpScreen';
import * as itemListScreens from './itemListScreens';
import { lookScreen } from './targetBasedScreens';

let Screen = {
  startScreen,
  winScreen,
  loseScreen,
  helpScreen,
  lookScreen,
  ...itemListScreens
};

export default Screen;
