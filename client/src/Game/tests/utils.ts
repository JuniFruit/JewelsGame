import type { Board } from "../board";

export function advanceStateBy(secs: number, board: Board) {
  const frameTime = 0.016;
  let left = secs;
  let t = 0;
  while (left >= 0) {
    board.update(t, frameTime);
    left -= frameTime;
    t += frameTime;
  }
}
