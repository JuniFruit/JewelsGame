import { JEWEL_SPELL_CONVERSION, P1_BOARD } from "../config";
import { Board } from "../board";
import { test, expect, describe, beforeEach } from "vitest";

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

function advanceStateBy(secs: number, board: Board) {
  const frameTime = 0.016;
  let left = secs;
  let t = 0;
  while (left >= 0) {
    board.update(t, frameTime);
    left -= frameTime;
    t += frameTime;
  }
}

function resetAllJewels(board: Board) {
  board.jewels.forEach((j) => j.reset());
}

describe("Board", () => {
  let board: Board;
  beforeEach(() => {
    board = new Board({
      position: P1_BOARD.position,
      size: P1_BOARD.size,
      cols: 8,
      rows: 8,
      player: "p1",
      health: 100,
    });
    board.generateJewels([...layout]);
    resetAllJewels(board);
  });
  test("swapping elements at edge", () => {
    const isSwapped = board?.attemptSwap(13, 5);
    board.generateJewels([...layout]);
    resetAllJewels(board);

    const isSwappedInverted = board.attemptSwap(5, 13);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping elements at edge (vertical)", () => {
    const isSwapped = board.attemptSwap(42, 50);
    board.generateJewels([...layout]);
    resetAllJewels(board);

    const isSwappedInverted = board.attemptSwap(50, 42);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });

  test("swapping elements at edge (vertical)", () => {
    const isSwapped = board.attemptSwap(12, 4);
    board.generateJewels([...layout]);
    resetAllJewels(board);

    const isSwappedInverted = board.attemptSwap(4, 12);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping elements at edge (horizontal)", () => {
    const isSwapped = board.attemptSwap(16, 17);
    board.generateJewels([...layout]);
    resetAllJewels(board);

    const isSwappedInverted = board.attemptSwap(17, 16);

    expect(isSwapped).toBe(true);
    expect(isSwappedInverted).toBe(true);
  });
  test("swapping illegal selections (diagonal)", () => {
    const isSwapped = board.attemptSwap(54, 45);
    board.generateJewels([...layout]);
    resetAllJewels(board);

    const isSwappedInverted = board.attemptSwap(45, 54);

    expect(isSwapped).toBe(false);
    expect(isSwappedInverted).toBe(false);
  });
  test("swapping illegal selections (out of bound)", () => {
    const isSwapped = board.attemptSwap(65, 4);
    board.generateJewels([...layout]);
    resetAllJewels(board);
    const isSwappedInverted = board.attemptSwap(65, 4);

    expect(isSwapped).toBe(false);
    expect(isSwappedInverted).toBe(false);
  });
  test("swapping illegal selections (not neighbors)", () => {
    const isSwapped = board.attemptSwap(42, 44);
    const isSwappedInverted = board.attemptSwap(44, 42);
    const isSwappedVertical = board.attemptSwap(14, 54);
    const isSwappedInvertedVertical = board.attemptSwap(54, 14);

    expect(isSwapped).toBe(false);
    expect(isSwappedInverted).toBe(false);
    expect(isSwappedVertical).toBe(false);
    expect(isSwappedInvertedVertical).toBe(false);
  });
  test("checking matches and removing", () => {
    board.removeOrMergeMatches();
    const indices = [18, 26, 34, 1, 2, 3];

    indices.forEach((ind) => {
      expect(board.jewels[ind].isRemoving).toBe(true);
    });
  });
  test("merge and move down", () => {
    const initialJewelType = board.jewels[12].jewelType;
    board.swapJewels(12, 4);
    board.removeOrMergeMatches();
    board.moveJewelsDown();

    expect(board.jewels[4].isMerging).toBe(true);
    expect(
      JEWEL_SPELL_CONVERSION[board.jewels[2].targetJewelType].parentType,
    ).toBe(initialJewelType);
  });
  test("after first swap second swap to the removing line should be illegal", () => {
    const swap1 = board.attemptSwap(35, 36);
    board.removeOrMergeMatches();
    // now we are in removing state
    const swap2 = board.attemptSwap(12, 13);
    expect(swap1).toBe(true);
    expect(swap2).toBe(false);
  });
  test("after swap at the bottom, second swap on the same column but higher should be illegal", () => {
    const swap1 = board.attemptSwap(54, 46);
    board.removeOrMergeMatches();
    // now we are in removing state
    const swap2 = board.attemptSwap(38, 37);
    expect(swap1).toBe(true);
    expect(swap2).toBe(false);
  });
  test("merge vertical", () => {
    const initialJewelType = board.jewels[17].jewelType;
    board.swapJewels(16, 17);
    board.removeOrMergeMatches();

    const indices = [0, 16, 24];

    expect(board.jewels[8].isConverting).toBe(true);
    expect(
      JEWEL_SPELL_CONVERSION[board.jewels[8].targetJewelType].parentType,
    ).toBe(initialJewelType);

    indices.forEach((i) => expect(board.jewels[i].isMerging).toBe(true));
  });
  test("merge vertical", () => {
    const initialJewelType = board.jewels[43].jewelType;
    board.swapJewels(42, 43);
    board.removeOrMergeMatches();

    expect(board.jewels[26].isConverting).toBe(true);
    expect(
      JEWEL_SPELL_CONVERSION[board.jewels[26].targetJewelType].parentType,
    ).toBe(initialJewelType);
  });
  test("remove after swap", () => {
    resetAllJewels(board);
    board.swapJewels(54, 46);
    board.removeOrMergeMatches();

    const indices = [44, 45, 46];
    indices.forEach((ind) => {
      expect(board.jewels[ind].isRemoving).toBe(true);
    });
  });
});
