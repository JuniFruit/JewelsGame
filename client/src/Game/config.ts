import { BoardProps } from "./entities";
import { Size } from "./sharedEntities";
import { ButtonProps } from "./UI";

// set debug mode, additional info and buttons will be rendered
export const DEBUG = true;
// cursor size bounds to check for collisions (used to check buttons collision for example)
export const MOUSE_SIZE: Size = {
  height: 10,
  width: 10,
};

// default board container size
export const BOARD_SIZE: Size = {
  width: 400,
  height: 500,
};

// default number of columns and rows on the board
export const BOARD_COLS = 8;
export const BOARD_ROWS = 8;

// default instantiation data for player 1 board
export const P1_BOARD: BoardProps = {
  position: {
    x: 10,
    y: 30,
  },
  player: "p1",
  health: 100,
  size: BOARD_SIZE,
  cols: BOARD_COLS,
  rows: BOARD_ROWS,
};

// default instantiation data for player 2 (opponent) board
export const P2_BOARD: BoardProps = {
  position: {
    x: P1_BOARD.position.x + BOARD_SIZE.width * 2,
    y: P1_BOARD.position.y,
  },
  player: "p2",
  health: 100,

  size: BOARD_SIZE,
  cols: BOARD_COLS,
  rows: BOARD_ROWS,
};

export type JewelSpellConversion = {
  matchesToGet: number;
  parentType: number;
};
export const JEWEL_SPELL_TYPE = {
  VAMPIRE: 7,
  CRIT_STRIKE: 8,
  STUN: 9,
  SHIELD: 10,
  POISON: 11,
  EXPLOSION: 12,
};

export const JEWEL_SPELL_CONVERSION: Record<string, JewelSpellConversion> = {
  [JEWEL_SPELL_TYPE.VAMPIRE]: { matchesToGet: 4, parentType: 1 },
  [JEWEL_SPELL_TYPE.CRIT_STRIKE]: { matchesToGet: 4, parentType: 2 },
  [JEWEL_SPELL_TYPE.STUN]: { matchesToGet: 4, parentType: 3 },
  [JEWEL_SPELL_TYPE.SHIELD]: { matchesToGet: 4, parentType: 4 },
  [JEWEL_SPELL_TYPE.POISON]: { matchesToGet: 4, parentType: 5 },
  [JEWEL_SPELL_TYPE.EXPLOSION]: { matchesToGet: 4, parentType: 6 },
};

// types of jewels existing in the game
// 1 - 6: regular types
// 7+: spell types
export const JEWEL_TYPE = {
  BLUE: 1,
  RED: 2,
  ORANGE: 3,
  GREEN: 4,
  PURPLE: 5,
  BROWN: 6,
  ...JEWEL_SPELL_TYPE,
};

// most likely will be deleted, only for debug
export const JEWEL_TYPE_TO_COLOR: Record<number, string> = {
  1: "blue",
  2: "red",
  3: "orange",
  4: "green",
  5: "purple",
  6: "brown",
  7: "blue",
  8: "red",
  9: "orange",
  10: "green",
  11: "purple",
  12: "brown",
};

export const DEFAULT_FONT_SIZE = "20px";

// UI button color themes

export const DEFAULT_BUTTON_THEME: Pick<
  ButtonProps,
  "bgColor" | "padding" | "bgHoverColor" | "icon" | "fontColor"
> = {
  bgColor: "#8a2be2",
  padding: 5,
  fontColor: "#ffffff",
};
