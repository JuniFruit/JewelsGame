import { FONT, FontWeight } from "../assets/fonts/fonts";
import { DEFAULT_FONT_SIZE } from "../config";
import {
  BaseEntityProps,
  Coords,
  InteractableEntity,
  Size,
} from "../sharedEntities";
import { setTransparency } from "../utils";

export type ButtonProps = Omit<BaseEntityProps, "type" | "size"> & {
  fontSize?: string;
  fontWeight?: FontWeight;
  disabled?: boolean;
  size?: Size;
  ctx: CanvasRenderingContext2D;
  onClick?: (btn: Button) => void;
  text?: string;
  icon?: string;
  bgColor?: string;
  bgHoverColor?: string;
  fontColor?: string;
  padding?: number;
};

export class Button extends InteractableEntity {
  disabled: boolean;
  ctx: CanvasRenderingContext2D;
  text: string;
  icon: string;
  bgColor: string;
  bgHoverColor: string;
  isHovered = false;
  fontColor: string;
  padding: number;
  textPos: Coords = { x: 0, y: 0 };
  isAnimating = false;
  onClickCb: ((btn: Button) => void) | undefined;
  textMeasure: TextMetrics | undefined;
  textHeight = 0;
  textWidth = 0;
  isSizeRelative = false; // size calculated based on text size
  fontSize: string;
  fontWeight: FontWeight;
  private fontFamily = "";
  private currentFont = "";

  constructor({
    size,
    fontSize = DEFAULT_FONT_SIZE,
    fontWeight,
    position,
    disabled = false,
    ctx,
    text = "",
    icon = "",
    bgColor = "",
    bgHoverColor = "",
    fontColor = "",
    padding = 0,
    onClick,
  }: ButtonProps) {
    super({ size: size || { width: 0, height: 0 }, position, type: "button" });
    this.ctx = ctx;
    this.text = text;
    this.icon = icon;
    this.fontSize = fontSize;
    this.bgColor = bgColor;
    this.bgHoverColor = bgHoverColor;
    this.disabled = disabled;
    this.fontColor = fontColor;
    this.padding = padding;
    this.onClickCb = onClick;
    this.fontFamily = FONT.family;

    if (!fontWeight) {
      this.fontWeight =
        FONT.styles.find((f) => f.useAsDefault)?.weight || "500";
    } else {
      this.fontWeight = fontWeight;
    }

    this.currentFont = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    // calcualate text size
    this.calculateText();

    if (!size) {
      this.calculateSize();
    }

    this.calculateTextPos();
    this.bgHoverColor = bgHoverColor || setTransparency(this.bgColor, 50);
  }

  disable() {
    this.bgHoverColor = setTransparency(this.bgColor, 10);
    this.disabled = true;
  }

  setText(text: string) {
    this.text = text;
    this.calculateText();
    this.calculateSize();
    this.calculateTextPos();
  }

  activate() {
    this.disabled = false;
    this.bgHoverColor = setTransparency(this.bgColor, 50);
  }

  private calculateText() {
    this.ctx.font = this.currentFont;
    this.textMeasure = this.ctx.measureText(this.text);
    this.textHeight =
      this.textMeasure.fontBoundingBoxAscent +
      this.textMeasure.fontBoundingBoxDescent;
    this.textWidth = this.textMeasure.width;
  }

  /**
   * calculates size based inside element
   */
  private calculateSize() {
    if (!this.textMeasure) return;
    this.isSizeRelative = true;
    this.size.width = this.textMeasure.width;
    this.size.height =
      this.textMeasure.fontBoundingBoxDescent +
      this.textMeasure.fontBoundingBoxAscent;
    if (this.padding) {
      this.size.height = this.size.height + this.padding;
      this.size.width = this.size.width + this.padding;
    }
  }

  mouseDown(mousePos: Coords): void {
    if (this.disabled) return;
    super.mouseDown(mousePos);
    this.position.y += 1;
    this.calculateTextPos();
  }

  mouseUp(mousePos: Coords): void {
    if (this.disabled) return;
    super.mouseUp(mousePos);
    if (this.onClickCb) {
      this.onClickCb(this);
    } else {
      console.warn(this, "No valid click callback");
    }
    this.position.y = this.initialPos.y;
    this.calculateTextPos();
  }
  checkIsHovered(mousePos: Coords): boolean {
    const isHovered = super.checkIsHovered(mousePos);
    if (!isHovered && this.isClicking) {
      this.position.y = this.initialPos.y;
      this.calculateTextPos();
    }
    return isHovered;
  }

  private calculateTextPos() {
    if (!this.textMeasure) return;
    // centered
    this.textPos.x =
      this.position.x + (this.size.width * 0.5 - this.textMeasure.width * 0.5);
    this.textPos.y =
      this.position.y +
      this.size.height * 0.5 +
      this.textMeasure.hangingBaseline * 0.5;
  }

  draw(_ctx: CanvasRenderingContext2D) {
    const prevFont = this.ctx.font;
    this.ctx.font = this.currentFont;
    if (this.isHovered) {
      this.ctx.fillStyle = this.bgHoverColor;
    } else {
      this.ctx.fillStyle = this.bgColor;
    }
    if (this.disabled) {
      this.ctx.fillStyle = "grey";
    }
    this.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(this.text, this.textPos.x, this.textPos.y);
    this.ctx.font = prevFont;
  }
}
