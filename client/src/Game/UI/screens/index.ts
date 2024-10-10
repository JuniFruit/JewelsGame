import { UI } from "..";
import { InteractableEntity } from "../../sharedEntities";
import { Debug } from "../../utils";
import { debugButtons, inSoloGameButtons } from "./game";
import { mainMenuButtons } from "./mainMenu";

export type ScreenLayout = {
  screenName: string;
  background: string;
  elements: InteractableEntity[];
};

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
