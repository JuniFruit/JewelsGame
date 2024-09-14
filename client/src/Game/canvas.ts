/**
 * Generic utilities that helps work with canvas api
 */

export function setCanvasSize(canvas: HTMLCanvasElement) {
  const { width, height } = canvas.getBoundingClientRect();
  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio: ratio } = window;
    const context = canvas.getContext("2d");
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context!.scale(ratio, ratio);
  }
}

export function setSmoothing(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}
