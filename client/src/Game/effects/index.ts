import { Effect } from "./base";

export class StunEffect extends Effect {
  update(t: number, dt: number): void {
    if (!this.isActive) return;

    this.timer.update(t, dt);

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
    this.timer.setPulseBound(1);
    this.timer.onPulse = this.tickHealth;
    super.activate();
  }

  update(t: number, dt: number): void {
    if (!this.isActive) return;

    this.timer.update(t, dt);
    if (this.timer.isEnded) {
      this.deactivate();
    }
  }
}
