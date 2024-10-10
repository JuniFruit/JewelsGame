import { Effect } from "./base";

export class StunEffect extends Effect {
  activate(): void {
    if (this.board.effects["shield"]?.isActive) {
      (this.board.effects["shield"] as any).stacks -= 1;
      return;
    }

    super.activate();
  }
  update(t: number, dt: number): void {
    if (!this.isActive) return;

    this.timer.update(t, dt);
    this.sprite?.update(t, dt);

    if (this.timer.isEnded) {
      this.deactivate();
    }
  }
}

export class PoisonEffect extends Effect {
  private tickHealth = () => {
    this.board?.applyDamage(0.5);
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

  update(t: number, dt: number): void {
    if (!this.isActive) return;

    this.timer.update(t, dt);
    this.sprite?.update(t, dt);

    if (this.timer.isEnded) {
      this.deactivate();
    }
  }
}

export class ShieldEffect extends Effect {
  stacks = 2;
  update(t: number, dt: number): void {
    this.sprite?.update(t, dt);

    if (this.stacks <= 0 && this.isActive) {
      this.deactivate();
    }
  }
}
