import { Game } from "./Game";
import { Coords } from "./sharedEntities";
import { UI } from "./UI";
import { Debug } from "./utils";

function mouseMove(e: MouseEvent, _game: Game, ui: UI, debugInstance?: Debug) {
  const mousePos: Coords = { x: e.offsetX, y: e.offsetY };

  ui.checkIsMouseIntersecting(mousePos);
  if (debugInstance) {
    debugInstance.setMouseCoords(mousePos);
  }
}

function mouseDown(e: MouseEvent, _game: Game, ui: UI, _debugInstance?: Debug) {
  const mousePos: Coords = { x: e.offsetX, y: e.offsetY };

  ui.mouseDown(mousePos);
}

function mouseUp(e: MouseEvent, _game: Game, ui: UI, _debugInstance?: Debug) {
  const mousePos: Coords = { x: e.offsetX, y: e.offsetY };

  ui.mouseUp(mousePos);
}

function mouseOut(e: MouseEvent, _game: Game, ui: UI, _debugInstance?: Debug) {
  const mousePos: Coords = { x: e.offsetX, y: e.offsetY };

  ui.mouseOut(mousePos);
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
      case "mouseout":
        mouseOut(e, game, ui, debugInstance);
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
