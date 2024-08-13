/**
 * Generic utilities that helps work with canvas api
 */

export function setCanvasSize(ctx: CanvasRenderingContext2D) {
  const canvas = ctx.canvas;
  const { width, height } = canvas.getBoundingClientRect();
  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio: ratio } = window;
    const context = ctx;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context!.scale(ratio, ratio);
  }
}
