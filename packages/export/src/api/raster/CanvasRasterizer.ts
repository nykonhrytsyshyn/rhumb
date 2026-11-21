import { RASTER_MIME_TYPES, type RasterFormat } from "./RasterFormat";
import type { RasterOptions, Rasterizer } from "./Rasterizer";

/** Browser rasterizer that draws the SVG onto a canvas. */
export class CanvasRasterizer implements Rasterizer {
  /**
   * @param matte colour painted under the drawing before it is drawn, or null
   *              to keep transparency. Formats without an alpha channel
   *              (JPEG) need one, otherwise see-through areas turn black.
   */
  public constructor(private readonly matte: string | null = null) {}

  public async rasterize(
    svg: string,
    width: number,
    height: number,
    { format, quality }: RasterOptions,
  ): Promise<Blob> {
    const image = await CanvasRasterizer.loadImage(svg);
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (context === null) {
      throw new Error("Canvas 2D context is not available");
    }

    if (this.matte !== null) {
      context.fillStyle = this.matte;
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(image, 0, 0, width, height);

    return CanvasRasterizer.toBlob(canvas, format, quality);
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

  private static toBlob(
    canvas: HTMLCanvasElement,
    format: RasterFormat,
    quality: number | undefined,
  ): Promise<Blob> {
    const mime = RASTER_MIME_TYPES[format];

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob === null) {
            reject(new Error(`${format.toUpperCase()} encoding failed`));
          } else if (blob.type !== mime) {
            // Browsers answer with PNG when they cannot encode the format
            reject(
              new Error(
                `This browser cannot encode ${format.toUpperCase()} images`,
              ),
            );
          } else {
            resolve(blob);
          }
        },
        mime,
        quality,
      );
    });
  }
}
