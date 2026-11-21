export type RasterFormat = "png" | "jpeg" | "webp";

export const RASTER_MIME_TYPES: Readonly<Record<RasterFormat, string>> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};
