import { BaseEntity, BaseEntityProps } from "./sharedEntities";

export type SpellProps = Omit<BaseEntityProps, "type"> & {};

export abstract class Spell extends BaseEntity {
  constructor({ position, size }: SpellProps) {
    super({ position, size, type: "spell" });
  }

  abstract update(t: number, dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
