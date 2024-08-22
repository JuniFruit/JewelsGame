import { Board } from "../entities";
import { test, expect, describe, beforeEach, afterEach } from "vitest";

/**
 *
 0-7:   1,6,6,6,5,6,5,4,
 8-15:  1,3,4,5,6,5,4,10,
 16-23: 2,1,5,6,5,3,9,2,
 24-31: 1,1,5,4,5,3,4,2,
 32-39: 4,3,5,5,3,5,3,3,
 40-47: 5,1,3,5,4,4,3,2,
 48-55: 5,5,2,3,3,1,4,5,
 56-63: 1,4,6,2,4,5,4,8,
 *
 */

const layout = [
  1, 6, 6, 6, 5, 6, 5, 4, 1, 3, 4, 5, 6, 5, 4, 10, 2, 1, 5, 6, 5, 3, 9, 2, 1, 1,
  5, 4, 5, 3, 4, 2, 4, 3, 5, 5, 3, 5, 3, 3, 5, 1, 3, 5, 4, 4, 3, 2, 5, 5, 2, 3,
  3, 1, 4, 5, 1, 4, 6, 2, 4, 5, 4, 8,
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
    board.generateJewels([...layout]);
  });
  afterEach(() => {
    board = undefined;
  });
  test("swapping elements at edge", () => {
    const isSwapped = board?.attemptSwap(13, 5);
    board?.generateJewels([...layout]);
    const isSwappedInverted = board?.attemptSwap(5, 13);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping elements at edge (vertical)", () => {
    const isSwapped = board?.attemptSwap(42, 50);
    board?.generateJewels([...layout]);
    const isSwappedInverted = board?.attemptSwap(50, 42);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });

  test("swapping elements at edge (vertical)", () => {
    const isSwapped = board?.attemptSwap(12, 4);
    board?.generateJewels([...layout]);

    const isSwappedInverted = board?.attemptSwap(4, 12);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping elements at edge (horizontal)", () => {
    const isSwapped = board?.attemptSwap(16, 17);
    board?.generateJewels([...layout]);

    const isSwappedInverted = board?.attemptSwap(17, 16);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping illegal selections (diagonal)", () => {
    const isSwapped = board?.attemptSwap(54, 45);
    board?.generateJewels([...layout]);

    const isSwappedInverted = board?.attemptSwap(45, 54);

    expect(isSwapped).toBe(false);
    expect(isSwappedInverted).toBe(false);
  });
  test("swapping illegal selections (out of bound)", () => {
    const isSwapped = board?.attemptSwap(65, 4);
    board?.generateJewels([...layout]);

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
