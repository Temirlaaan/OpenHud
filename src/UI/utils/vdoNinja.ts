/**
 * VDO.Ninja URL utilities for OpenHud
 */

export interface VdoNinjaViewOptions {
  autoplay?: boolean;
  muted?: boolean;
  cleanOutput?: boolean;
  quality?: number; // 0-2
  codec?: string;
  noAudio?: boolean;
}

export interface VdoNinjaPushOptions {
  webcam?: boolean;
  autostart?: boolean;
  quality?: number; // 0-2
  codec?: string;
  label?: string;
}

/**
 * Build a VDO.Ninja viewer URL
 * @param streamId - The stream ID to view
 * @param options - Optional configuration
 * @returns Full VDO.Ninja URL for viewing the stream
 */
export const buildVdoNinjaViewUrl = (
  streamId: string,
  options: VdoNinjaViewOptions = {}
): string => {
  // If already a full URL, return as-is
  if (streamId.startsWith("http://") || streamId.startsWith("https://")) {
    return streamId;
  }

  const params = new URLSearchParams({
    view: streamId,
  });

  if (options.autoplay !== false) {
    params.set("autoplay", "1");
  }
  if (options.muted !== false) {
    params.set("muted", "1");
  }
  if (options.cleanOutput !== false) {
    params.set("cleanoutput", "1");
  }
  if (options.quality !== undefined) {
    params.set("quality", String(options.quality));
  }
  if (options.codec) {
    params.set("codec", options.codec);
  }
  if (options.noAudio) {
    params.set("noaudio", "1");
  }

  return `https://vdo.ninja/?${params.toString()}`;
};

/**
 * Build a VDO.Ninja push URL for players to stream their camera
 * @param streamId - The stream ID to push to
 * @param options - Optional configuration
 * @returns Full VDO.Ninja URL for pushing a stream
 */
export const buildVdoNinjaPushUrl = (
  streamId: string,
  options: VdoNinjaPushOptions = {}
): string => {
  const params = new URLSearchParams({
    push: streamId,
  });

  if (options.webcam !== false) {
    params.set("webcam", "1");
  }
  if (options.autostart !== false) {
    params.set("autostart", "1");
  }
  if (options.quality !== undefined) {
    params.set("quality", String(options.quality));
  }
  if (options.codec) {
    params.set("codec", options.codec);
  }
  if (options.label) {
    params.set("label", options.label);
  }

  return `https://vdo.ninja/?${params.toString()}`;
};

/**
 * Generate a random stream ID
 * @param length - Length of the ID (default: 8)
 * @returns Random alphanumeric string
 */
export const generateStreamId = (length: number = 8): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Extract stream ID from a VDO.Ninja URL
 * @param url - VDO.Ninja URL
 * @returns Stream ID or null if not found
 */
export const extractStreamId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("view") || urlObj.searchParams.get("push");
  } catch {
    // If not a valid URL, assume it's already a stream ID
    return url;
  }
};

/**
 * Validate a stream ID
 * @param streamId - Stream ID to validate
 * @returns True if valid
 */
export const isValidStreamId = (streamId: string): boolean => {
  // Stream IDs should be alphanumeric, 3-32 characters
  return /^[a-zA-Z0-9]{3,32}$/.test(streamId);
};
