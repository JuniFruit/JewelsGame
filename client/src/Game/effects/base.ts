import { Timer } from "../sharedEntities";

export type EffectProps = {
  activeTime?: number;
  effectType: string;
};

export abstract class Effect {
  isActive = false;
  timer: Timer;
  effectType: string;
  constructor({ activeTime = 0, effectType }: EffectProps) {
    this.effectType = effectType;
    this.timer = new Timer({ time: activeTime });
  }

  activate() {
    this.isActive = true;
    this.timer.reset();
    this.timer.start();
  }

  deactivate() {
    this.isActive = false;
  }

  abstract update(t: number, dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
