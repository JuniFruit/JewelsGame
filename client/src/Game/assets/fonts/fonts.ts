import font_bold from "./font-bold.ttf";
import font_light from "./font-light.ttf";
import font_medium from "./font-medium.ttf";

export type FontWeight = "800" | "300" | "500" | "400" | "100";
type FontDescriptor = {
  src: any;
  weight: FontWeight;
  useAsDefault?: boolean;
};
type Font = {
  family: string;
  styles: FontDescriptor[];
};
export const FONT: Font = {
  family: "Poppins",
  styles: [
    { weight: "800", src: font_bold },
    { weight: "300", src: font_light },
    { weight: "500", src: font_medium, useAsDefault: true },
  ],
};
