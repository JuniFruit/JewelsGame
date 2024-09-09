import { setCanvasSize } from "./canvas";
import { DEBUG } from "./config";
import { Game } from "./Game";
import { initInputs } from "./inputs";
import { initGameScreens } from "./screens";
import { initFonts, UI } from "./UI";
import { Debug } from "./utils";

let secondsPassed = 0;
let oldTimeStamp = 0;
let ctx: CanvasRenderingContext2D;
let debugInstance: Debug | undefined;
let game: Game;
let timePassed = 0;
let ui: UI;
const dt_bound = 0.01;

export async function init(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser does not support this game");
  }
  ctx = context;
  setCanvasSize(context);
  ui = new UI(context);
  await initFonts(ui);
  game = new Game({ ctx });
  debugInstance = DEBUG ? new Debug(game, context) : undefined;

  ui.game = game;

  const cleanInputs = initInputs(canvas, game, ui, debugInstance);
  initGameScreens(ui, game, context, debugInstance);
  ui.setCurrentScreen("game");

  // start gameLoop
  window.requestAnimationFrame(gameLoop);

  return () => {
    cleanInputs();
  };
}

function gameLoop(timeStamp: number) {
  // time
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;

  if (
    debugInstance &&
    debugInstance.isFPSThrottling &&
    secondsPassed <= debugInstance.FPSThrottle
  ) {
    return window.requestAnimationFrame(gameLoop);
  }
  if (secondsPassed <= dt_bound) return window.requestAnimationFrame(gameLoop);
  oldTimeStamp = timeStamp;

  if (debugInstance) {
    debugInstance.update(secondsPassed, timePassed);
  }

  while (secondsPassed > 0.0) {
    const dt = Math.min(secondsPassed, dt_bound);
    if (debugInstance?.isSlowTime) {
      game.update(timePassed, dt * 0.5);
    } else {
      game.update(timePassed, dt);
    }

    secondsPassed -= dt;
    timePassed += dt;
  }

  draw();
  window.requestAnimationFrame(gameLoop);
}

function draw() {
  ui.drawFont();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  game.draw();
  ui.draw();
  if (debugInstance) {
    debugInstance.showDebug();
  }
}
