/** Margin kept around the fitted page inside the preview, in pixels. */
export const PREVIEW_MARGIN = 24;

/** Small diagrams are enlarged at most this much when fitted to the preview. */
export const MAX_ENLARGEMENT = 2;

/** Lowest fit scale allowed, so even very large diagrams can be fitted. */
export const MIN_FIT_SCALE = 0.02;

/** Maximum magnification relative to the diagram's natural pixel size. */
export const MAX_NATURAL_ZOOM = 8;

/** Minimum magnification relative to the fitted view (for small diagrams). */
export const MIN_RELATIVE_ZOOM = 8;

/** Magnification factor applied when double-clicking or double-tapping to zoom in. */
export const DOUBLE_CLICK_ZOOM_FACTOR = 2;

export const WHEEL_ZOOM_STEP = 0.002;

/** Above this multiple of `fitScale`, the picture counts as magnified and a finger drags it. */
export const ZOOMED_THRESHOLD = 1.001;

/**
 * Height the settings need beside a pinned preview to stay usable. A preview
 * is only pinned while the dialog leaves at least this much room for them.
 */
export const MIN_SETTINGS_ROOM = 240;

export const PIN_STORAGE_KEY = "rhumb:export-preview-pinned";
