import { FONT, FontWeight } from "./assets/fonts/fonts";
import { DEFAULT_FONT_SIZE } from "./config";
import { Board } from "./entities";
import { Game } from "./Game";
import {
  BaseEntityProps,
  Coords,
  InteractableEntity,
  Size,
} from "./sharedEntities";
import { setTransparency } from "./utils";

export async function initFonts(ui: UI) {
  const fontPromises = FONT.styles.map(async (font) => {
    const newFont = new FontFace(FONT.family, `url(${font.src})`, {
      weight: font.weight,
    });
    try {
      await newFont.load();
      document.fonts.add(newFont);
      if (font.useAsDefault) {
        ui.setCurrentFont(font.weight, FONT.family);
      }
    } catch (error) {
      console.warn("Failed to load font: " + error);
    }
  });
  await Promise.all(fontPromises);
}

export type HealthBarProps = Omit<BaseEntityProps, "type"> & {
  board: Board;
  player: "p1" | "p2";
};

export class HealthBar extends InteractableEntity {
  board: Board;
  currentHealth: number;
  fillColor = "";
  ctx: CanvasRenderingContext2D | undefined;
  private latestDmg = 0;
  private applyingFactor = 10;
  private textPos: Coords = { x: 0, y: 0 };
  isApplyingDmg = false;

  constructor({ position, size, board, player }: HealthBarProps) {
    super({ position, size, type: "healthbar" });
    this.board = board;
    this.currentHealth = board.health;
    this.fillColor = player === "p1" ? "blue" : "red";
  }

  applyDamage(val: number) {
    this.isApplyingDmg = true;
    this.latestDmg = val;
    this.calculateTextPos(`-${this.latestDmg}`);
  }

  private calculateText(text: string) {
    // this.ctx.font = this.currentFont;
    const textMeasure = this.ctx?.measureText(text);
    return textMeasure;
  }

  private calculateTextPos(text: string) {
    const textMeasure = this.calculateText(text);
    if (!textMeasure) return;
    // centered
    this.textPos.x =
      this.position.x +
      (this.initialSize.width * 0.5 - textMeasure.width * 0.5);
    this.textPos.y =
      this.position.y +
      this.initialSize.height * 0.5 +
      textMeasure.hangingBaseline * 0.5;
  }

  private updateApplyDmg(_t: number, dt: number) {
    this.currentHealth -= this.latestDmg * this.applyingFactor * dt;
    this.size.width = this.initialSize.width * (this.currentHealth * 0.01);
    if (this.currentHealth <= this.board.health) {
      this.isApplyingDmg = false;
      this.currentHealth = this.board.health;
    }
  }

  update(t: number, dt: number) {
    if (this.isApplyingDmg) {
      this.updateApplyDmg(t, dt);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.ctx) {
      this.ctx = ctx;
    }
    ctx.lineWidth = 2;
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.initialSize.width,
      this.initialSize.height,
    );

    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    if (this.isApplyingDmg) {
      this.ctx.fillStyle = "black";
      this.ctx.fillText(`-${this.latestDmg}`, this.textPos.x, this.textPos.y);
    }
  }
}

export type ButtonProps = Omit<BaseEntityProps, "type" | "size"> & {
  fontSize?: string;
  fontWeight?: FontWeight;
  disabled?: boolean;
  size?: Size;
  ctx: CanvasRenderingContext2D;
  onClick?: () => void;
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
  onClickCb: (() => void) | undefined;
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

    if (padding) {
      this.size.height = this.size.height + padding;
      this.size.width = this.size.width + padding;
    }
    this.calculateTextPos();
    this.bgHoverColor = bgHoverColor || setTransparency(this.bgColor, 50);
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
  }

  mouseDown(): void {
    super.mouseDown();
    this.position.y += 1;
    this.calculateTextPos();
  }

  mouseUp(): void {
    super.mouseUp();
    if (this.onClickCb) {
      this.onClickCb();
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

  draw() {
    this.ctx.font = this.currentFont;
    if (this.isHovered) {
      this.ctx.fillStyle = this.bgHoverColor;
    } else {
      this.ctx.fillStyle = this.bgColor;
    }
    this.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height,
    );
    this.ctx.fillStyle = this.fontColor;
    this.ctx.fillText(this.text, this.textPos.x, this.textPos.y);
  }
}

export type ScreenLayout = {
  screenName: string;
  background: string;
  elements: Button[];
};

export class UI {
  screens: Map<string, ScreenLayout> = new Map();
  ctx: CanvasRenderingContext2D;
  currentScreen = "";
  currentElements: ScreenLayout["elements"] = [];
  fontSize = DEFAULT_FONT_SIZE;
  fontFamily = "Arial";
  fontWeight = "light";
  currentFont = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
  currentHoveredElement: InteractableEntity | undefined;
  game: Game | undefined;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setCurrentScreen(key: string) {
    if (!this.screens.has(key)) {
      console.warn("No screen with name " + key + " found");
      return;
    }
    const screen = this.screens.get(key);
    this.currentScreen = screen!.screenName;
    this.currentElements = screen!.elements;
  }

  setCurrentFont(weight: FontWeight, family: string, size = DEFAULT_FONT_SIZE) {
    this.currentFont = `${weight} ${size} ${family}`;
    this.fontSize = size;
    this.fontFamily = family;
    this.fontWeight = weight;
  }

  drawFont() {
    this.ctx.font = this.currentFont;
  }

  addScreen(key: string, layout: ScreenLayout) {
    this.screens.set(key, layout);
  }

  mouseDown() {
    this.game?.p1Board?.mouseDown();
    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseDown();
    }
  }

  mouseUp() {
    this.game?.p1Board?.mouseUp();

    if (this.currentHoveredElement) {
      this.currentHoveredElement.mouseUp();
    }
  }

  checkIsMouseIntersecting(mousePos: Coords) {
    if (this.game?.p1Board) {
      this.game?.p1Board.checkIsHovered(mousePos);
    }
    if (
      this.currentHoveredElement &&
      this.currentHoveredElement.checkIsHovered(mousePos)
    ) {
      return;
    }
    this.currentHoveredElement = undefined;
    for (let i = 0; i < this.currentElements.length; i++) {
      if (this.currentElements[i].checkIsHovered(mousePos)) {
        this.currentHoveredElement = this.currentElements[i];
        break;
      }
    }
  }

  draw() {
    for (let i = 0; i < this.currentElements.length; i++) {
      this.currentElements[i].draw();
    }
  }
}
