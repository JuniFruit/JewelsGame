import { DEFAULT_BUTTON_THEME } from "./config";
import { Game } from "./Game";
import { ScreenLayout, UI } from "./UI";
import { Button } from "./UI/button";
import { Debug } from "./utils";

export function initGameScreens(
  ui: UI,
  game: Game,
  ctx: CanvasRenderingContext2D,
  debugInstance?: Debug,
) {
  const screens: ScreenLayout[] = [
    {
      screenName: "game",
      background: "",
      elements: [...(debugInstance ? debugButtons(ctx, debugInstance!) : [])],
    },
    {
      screenName: "main_menu",
      background: "",
      elements: [...mainMenuButtons(ctx, ui)],
    },
  ];

  screens.forEach((s) => {
    ui.addScreen(s.screenName, s);
  });
}

function mainMenuButtons(ctx: CanvasRenderingContext2D, ui: UI) {
  console.log(ctx.canvas.getBoundingClientRect().x);
  return [
    new Button({
      position: {
        x: 0 + ctx.canvas.getBoundingClientRect().width / 2,
        y: 200,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Solo game",
      padding: 10,
      fontSize: "20px",
      onClick: () => ui.setCurrentScreen("game"),
    }),
    new Button({
      position: {
        x: ctx.canvas.width * 0.5,
        y: 70,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Settings",
      padding: 10,
      fontSize: "10px",
    }),
  ];
}

function debugButtons(ctx: CanvasRenderingContext2D, debugInstance: Debug) {
  return [
    new Button({
      position: {
        x: 450,
        y: 50,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Create board",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.setTestBoards(),
    }),
    new Button({
      position: {
        x: 550,
        y: 50,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "FPS throttle",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.toggleFPSThrottle(),
    }),
    new Button({
      position: {
        x: 650,
        y: 50,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Generate set board",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.setTestBoards(false),
    }),
    new Button({
      position: {
        x: 650,
        y: 80,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Jewel info",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.toggleJewelsDebug(),
    }),
    new Button({
      position: {
        x: 550,
        y: 80,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Slow time",
      padding: 10,
      fontSize: "10px",
      onClick: () => debugInstance.slowTime(),
    }),
  ];
}
