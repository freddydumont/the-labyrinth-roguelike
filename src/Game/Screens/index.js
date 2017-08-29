import { startScreen } from './startScreen';
import { winScreen } from './winScreen';
import { loseScreen } from './loseScreen';
import { helpScreen } from './helpScreen';
import * as itemListScreens from './itemListScreens';

let Screen = {
  startScreen,
  winScreen,
  loseScreen,
  helpScreen,
  ...itemListScreens
};

export default Screen;
