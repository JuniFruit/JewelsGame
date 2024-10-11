import { Effect, EffectProps } from "./base";

export class StunEffect extends Effect {
  activate(): void {
    if (this.board.effects["shield"]?.isActive) {
      (this.board.effects["shield"] as any).stacks -= 1;
      return;
    }

    super.activate();
  }
}

export class PoisonEffect extends Effect {
  private tickHealth = () => {
    this.board?.applyDamage(15);
  };

  activate(): void {
    if (this.board.effects["shield"]?.isActive) {
      (this.board.effects["shield"] as any).stacks -= 1;
      return;
    }
    this.timer.setPulseBound(1);
    this.timer.onPulse = this.tickHealth;
    super.activate();
  }
}

export class ShieldEffect extends Effect {
  constructor(props: EffectProps) {
    super({ ...props, isNegative: false });
  }

  stacks = 2;
  activate(): void {
    super.activate();
    this.stacks = 2;
  }
  update(t: number, dt: number): void {
    this.sprite?.update(t, dt);

    if (this.stacks <= 0 && this.isActive) {
      this.deactivate();
    }
  }
}

export class FatigueEffect extends Effect {}

export class LiturgyEffect extends Effect {
  constructor(props: EffectProps) {
    super({ ...props, isNegative: false });
    this.heal = this.heal.bind(this);
    this.timer.setPulseBound(1);
    this.timer.onPulse = this.heal;
  }
  activate(): void {
    super.activate();
    this.removeDebuffs();
  }
  private removeDebuffs() {
    for (let i = 0; i < this.board.effectKeys.length; i++) {
      const key = this.board.effectKeys[i];
      const effect = this.board.effects[key];
      if (effect.isNegative) {
        effect.deactivate();
      }
    }
  }
  private heal() {
    this.board.applyHeal(20);
  }
}
