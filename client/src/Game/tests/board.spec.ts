import { Board } from "../entities";
import { test, expect, describe, beforeEach, afterEach } from "vitest";

/**
 *
 0-7:   1,6,6,6,7,6,7,8,
 8-15:  1,3,4,5,6,7,8,9,
 16-23: 2,1,5,6,7,3,9,2,
 24-31: 1,1,5,4,7,3,8,2,
 32-39: 4,3,7,7,3,7,3,3,
 40-47: 5,1,3,5,8,8,3,2,
 48-55: 7,7,2,3,3,1,4,5
 56-63: 1,4,6,2,4,5,8,7
 *
 */

const layout = [
  1, 6, 6, 6, 7, 6, 7, 8, 1, 3, 4, 5, 6, 7, 8, 9, 2, 1, 5, 6, 7, 3, 9, 2, 1, 1,
  5, 4, 7, 3, 8, 2, 4, 3, 7, 7, 3, 7, 3, 3, 5, 1, 3, 5, 8, 8, 3, 2, 7, 7, 2, 3,
  3, 1, 4, 5, 1, 4, 6, 2, 4, 5, 8, 7,
];

describe("Board", () => {
  let board: undefined | Board;
  beforeEach(() => {
    board = new Board({
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
      cols: 8,
      rows: 8,
    });
    board.setLayout([...layout]);
    board.generateJewels();
  });
  afterEach(() => {
    board = undefined;
  });
  test("swapping elements at edge", () => {
    const isSwapped = board?.attemptSwap(13, 5);
    board?.setLayout([...layout]);
    board?.generateJewels();
    const isSwappedInverted = board?.attemptSwap(5, 13);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test.only("swapping elements at edge (vertical)", () => {
    const isSwapped = board?.attemptSwap(42, 50);
    board?.setLayout([...layout]);
    board?.generateJewels();
    const isSwappedInverted = board?.attemptSwap(50, 42);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });

  test("swapping elements at edge (vertical)", () => {
    const isSwapped = board?.attemptSwap(12, 4);
    board?.setLayout([...layout]);
    board?.generateJewels();

    const isSwappedInverted = board?.attemptSwap(4, 12);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping elements at edge (horizontal)", () => {
    const isSwapped = board?.attemptSwap(16, 17);
    board?.setLayout([...layout]);
    board?.generateJewels();

    const isSwappedInverted = board?.attemptSwap(17, 16);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping illegal selections (diagonal)", () => {
    const isSwapped = board?.attemptSwap(54, 45);
    board?.setLayout([...layout]);
    board?.generateJewels();

    const isSwappedInverted = board?.attemptSwap(45, 54);

    expect(isSwapped).toBe(false);
    expect(isSwappedInverted).toBe(false);
  });
  test("swapping illegal selections (out of bound)", () => {
    const isSwapped = board?.attemptSwap(65, 4);
    board?.setLayout([...layout]);
    board?.generateJewels();

    const isSwappedInverted = board?.attemptSwap(65, 4);

    expect(isSwapped).toBe(false);
    expect(isSwappedInverted).toBe(false);
  });
  test("swapping illegal selections (not neighbors)", () => {
    const isSwapped = board?.attemptSwap(42, 44);
    const isSwappedInverted = board?.attemptSwap(44, 42);
    const isSwappedVertical = board?.attemptSwap(14, 54);
    const isSwappedInvertedVertical = board?.attemptSwap(54, 14);

    expect(isSwapped).toBe(false);
    expect(isSwappedInverted).toBe(false);
    expect(isSwappedVertical).toBe(false);
    expect(isSwappedInvertedVertical).toBe(false);
  });
});
