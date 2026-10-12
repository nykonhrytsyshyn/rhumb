import type { Rasterizer } from "./Rasterizer";

/** Browser rasterizer that draws the SVG onto a canvas. */
export class CanvasRasterizer implements Rasterizer {
  /** @param background page colour, or null for a transparent PNG. */
  public constructor(private readonly background: string | null = "#ffffff") {}

  public async rasterize(
    svg: string,
    width: number,
    height: number,
  ): Promise<Blob> {
    const image = await CanvasRasterizer.loadImage(svg);
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (context === null) {
      throw new Error("Canvas 2D context is not available");
    }

    if (this.background !== null) {
      context.fillStyle = this.background;
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(image, 0, 0, width, height);

    return CanvasRasterizer.toBlob(canvas);
  }

  private static loadImage(svg: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };
      image.onerror = () => {
        reject(new Error("The SVG could not be loaded as an image"));
      };
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
  }

  private static toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob === null) {
          reject(new Error("PNG encoding failed"));
        } else {
          resolve(blob);
        }
      }, "image/png");
    });
  }
}
