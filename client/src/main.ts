import { init } from "./Game/app";
import "./styles/main.css";

const canvas = document.createElement("canvas");

canvas.setAttribute("id", "canvas");
document.getElementById("app")?.appendChild(canvas);

init(canvas);
