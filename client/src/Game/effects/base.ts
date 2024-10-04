import { Board } from "../board";
import { Timer } from "../sharedEntities";

export type EffectProps = {
  activeTime?: number;
  effectType: string;
  board: Board;
};

export abstract class Effect {
  isActive = false;
  timer: Timer;
  effectType: string;
  board: Board;
  constructor({ activeTime = 0, effectType, board }: EffectProps) {
    this.effectType = effectType;
    this.timer = new Timer({ time: activeTime });
    this.board = board;
  }

  activate() {
    console.log("activated", this.effectType);
    this.isActive = true;
    this.timer.reset();
    this.timer.start();
  }

  deactivate() {
    this.isActive = false;
  }

  abstract update(t: number, dt: number): void;
}
