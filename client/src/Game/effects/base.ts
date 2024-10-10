import { createAnimationWithSprite, createSprite, Sprite } from "../animation";
import { Board } from "../board";
import { Coords, Size, Timer } from "../sharedEntities";

export type EffectProps = {
  activeTime?: number;
  animPos?: Coords;
  animSize?: Size;
  animKey?: string;
  effectType: string;
  board: Board;
};

export abstract class Effect {
  isActive = false;
  effectType: string;
  timer: Timer;
  board: Board;
  sprite: Sprite | undefined;
  constructor({
    activeTime = 0,
    animSize,
    animPos,
    animKey = "",
    effectType,
    board,
  }: EffectProps) {
    this.effectType = effectType;
    this.board = board;
    this.timer = new Timer({ time: activeTime });
    this.sprite = createSprite(animPos || { x: 0, y: 0 }, animKey, animSize);
  }

  activate() {
    this.timer.start();
    this.sprite?.play();
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  abstract update(t: number, dt: number): void;
  draw(ctx: CanvasRenderingContext2D) {
    if (this.isActive) {
      this.sprite?.draw(ctx);
    }
  }
}
