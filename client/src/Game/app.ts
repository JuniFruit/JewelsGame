import { setCanvasSize, setSmoothing } from "./canvas";
import { DEBUG, P1_BOARD } from "./config";
import { Game } from "./game";
import { initAllImages } from "./animation/config";
import { initInputs } from "./inputs";
import { initFonts, UI } from "./UI";
import { Debug } from "./utils";
import { initGameScreens } from "./UI/screens";

let secondsPassed = 0;
let oldTimeStamp = 0;
let ctx: CanvasRenderingContext2D;
let bgCtx: CanvasRenderingContext2D;
let debugInstance: Debug | undefined;
let game: Game;
let timePassed = 0;
let ui: UI;
const dt_bound = 0.01;

export async function init() {
  const style = {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: "0",
    left: "0",
  };
  const bgCanvas = document.createElement("canvas");
  bgCanvas.setAttribute("id", "bg_canvas");
  document.getElementById("app")?.appendChild(bgCanvas);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "canvas");
  document.getElementById("app")?.appendChild(canvas);

  Object.assign(bgCanvas.style, style);
  Object.assign(canvas.style, style);

  const context = canvas.getContext("2d");
  const bgContext = bgCanvas.getContext("2d");
  if (!context || !bgContext) {
    throw new Error("Your browser does not support this game");
  }
  ctx = context;
  bgCtx = bgContext;
  setCanvasSize(canvas);
  setCanvasSize(bgCanvas);
  setSmoothing(ctx);
  setSmoothing(bgCtx);
  ui = new UI(context, bgContext);
  await initFonts(ui);
  await initAllImages();
  game = new Game({});
  game.p2Board.position.x =
    canvas.getBoundingClientRect().width -
    10 -
    game.p2Board.size.width -
    P1_BOARD.position.x;
  debugInstance = DEBUG ? new Debug(game, context) : undefined;

  const cleanInputs = initInputs(canvas, game, ui, debugInstance);
  initGameScreens(ui, game, context, debugInstance);
  ui.setCurrentScreen("main_menu");

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
      game.update(timePassed, dt * 0.3);
    } else {
      game.update(timePassed, dt);
    }
    ui.update(timePassed, dt);

    secondsPassed -= dt;
    timePassed += dt;
  }

  draw();
  window.requestAnimationFrame(gameLoop);
}

function draw() {
  ui.drawBackground();
  ui.drawFont();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ui.draw();
  if (debugInstance) {
    debugInstance.showDebug();
  }
}
