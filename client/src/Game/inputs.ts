import { Coords } from "./entities";
import { Game } from "./Game";
import { UI } from "./UI";
import { Debug } from "./utils";

function mouseMove(e: MouseEvent, game: Game, ui: UI, debugInstance?: Debug) {
  const mousePos: Coords = { x: e.offsetX, y: e.offsetY };
  ui.checkIsMouseIntersecting(mousePos);
  if (debugInstance) {
    debugInstance.setMouseCoords(mousePos);
  }
}

function mouseDown(e: MouseEvent, game: Game, ui: UI, debugInstance?: Debug) {
  ui.mouseDown();
}

function mouseUp(e: MouseEvent, game: Game, ui: UI, debugInstance?: Debug) {
  ui.mouseUp();
}

export function initInputs(
  canvas: HTMLCanvasElement,
  game: Game,
  ui: UI,
  debugInstance?: Debug,
) {
  const handleMouseEvent = (e: MouseEvent) => {
    switch (e.type) {
      case "mousemove":
        mouseMove(e, game, ui, debugInstance);
        break;
      case "mousedown":
        mouseDown(e, game, ui, debugInstance);
        break;
      case "mouseup":
        mouseUp(e, game, ui, debugInstance);
        break;

      default:
        return;
    }
  };

  canvas.addEventListener("mouseup", handleMouseEvent);
  canvas.addEventListener("mousedown", handleMouseEvent);
  canvas.addEventListener("mouseout", handleMouseEvent);
  canvas.addEventListener("mousemove", handleMouseEvent);
  canvas.addEventListener("mouseenter", handleMouseEvent);
  canvas.addEventListener("mouseleave", handleMouseEvent);

  return () => {
    canvas.removeEventListener("mouseup", handleMouseEvent);
    canvas.removeEventListener("mousedown", handleMouseEvent);
    canvas.removeEventListener("mouseout", handleMouseEvent);
    canvas.removeEventListener("mousemove", handleMouseEvent);
    canvas.removeEventListener("mouseenter", handleMouseEvent);
    canvas.removeEventListener("mouseleave", handleMouseEvent);
  };
}
