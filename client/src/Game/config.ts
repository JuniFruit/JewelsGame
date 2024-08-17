import { BoardProps, Size } from "./entities";
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
  size: BOARD_SIZE,
  cols: BOARD_COLS,
  rows: BOARD_ROWS,
};

// types of jewels existing in the game
export const JEWEL_TYPE = {
  BLUE: 1,
  RED: 2,
  ORANGE: 3,
  GREEN: 4,
  PURPLE: 5,
  BROWN: 6,
  VAMPIRE: 7,
  CRIT_STRIKE: 8,
  STUN: 9,
  SHIELD: 10,
  POISON: 11,
  EXPLOSION: 12,
  SUPER_CRIT_STRIKE: 13,
  SUPER_SHIELD: 14,
};

export type ConversionType = [number, number];
export type ConversionMap = {
  [key: number]: ConversionType[];
};
// Sets what jewel types merge into what skill
export const JEWEL_CONVERSION_MAP: ConversionMap = {
  [JEWEL_TYPE.BLUE]: [[JEWEL_TYPE.STUN, 4]],
  [JEWEL_TYPE.RED]: [[JEWEL_TYPE.CRIT_STRIKE, 4]],
  [JEWEL_TYPE.ORANGE]: [[JEWEL_TYPE.EXPLOSION, 4]],
  [JEWEL_TYPE.GREEN]: [[JEWEL_TYPE.POISON, 4]],
  [JEWEL_TYPE.PURPLE]: [[JEWEL_TYPE.SHIELD, 4]],
  [JEWEL_TYPE.BROWN]: [[JEWEL_TYPE.VAMPIRE, 4]],
};

// rare jewels that can be obtained only randomly
export const RARE_JEWELS = {
  POISON: 11,
  EXPLOSION: 12,
  SUPER_CRIT_STRIKE: 13,
  SUPER_SHIELD: 14,
};

// most likely will be deleted, only for debug
export const JEWEL_TYPE_TO_COLOR: Record<number, string> = {
  1: "blue",
  2: "red",
  3: "orange",
  4: "green",
  5: "purple",
  6: "brown",
  7: "#cdeb00",
  8: "#b30000",
  9: "#0000cc",
  10: "#fff9d8",
  11: "#d0ff2f",
  12: "#ffbf00",
  13: "#760000",
  14: "#daa520",
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
