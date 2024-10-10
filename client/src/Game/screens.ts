import { DEFAULT_BUTTON_THEME } from "./config";
import { ScreenLayout, UI } from "./UI";
import { Button } from "./UI/button";
import { Debug } from "./utils";

export function initGameScreens(
  ui: UI,
  ctx: CanvasRenderingContext2D,
  debugInstance?: Debug,
) {
  const screens: ScreenLayout[] = [
    {
      screenName: "solo_game",
      background: "",
      elements: [
        ...(debugInstance ? debugButtons(ctx, debugInstance!) : []),
        ...inSoloGameButtons(ctx, ui),
      ],
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

function inSoloGameButtons(ctx: CanvasRenderingContext2D, ui: UI) {
  return [
    new Button({
      position: {
        x: 0 + ctx.canvas.getBoundingClientRect().width / 2,
        y: 150,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Start game",
      padding: 10,
      disabled: ui.game?.isStarted,
      fontSize: "10px",
      onClick: (btn) => {
        ui.game?.startGame();
        btn.disable();
      },
    }),
    new Button({
      position: {
        x: 0 + ctx.canvas.getBoundingClientRect().width / 2,
        y: 180,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: ui.game?.isPaused ? "Unpause" : "Pause",
      padding: 10,
      disabled: ui.game?.isPaused,
      fontSize: "10px",
      onClick: (btn) => {
        ui.game?.setPause(!ui.game.isPaused);
        btn.setText(ui.game?.isPaused ? "Unpause" : "Pause");
      },
    }),
    new Button({
      position: {
        x: 0 + ctx.canvas.getBoundingClientRect().width / 2,
        y: 200,
      },
      ctx,
      ...DEFAULT_BUTTON_THEME,
      text: "Quit",
      padding: 10,
      fontSize: "10px",
      onClick: () => {
        ui.setCurrentScreen("main_menu");
        ui.game?.reset();
      },
    }),
  ];
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
      onClick: () => ui.setCurrentScreen("solo_game"),
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
