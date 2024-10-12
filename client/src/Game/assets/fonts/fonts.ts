import custom from "./custom.otf";

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
  family: "Custom",
  styles: [{ weight: "800", src: custom, useAsDefault: true }],
};
