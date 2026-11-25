const CHUNK = 0x8000;

export function toBase64(bytes: Uint8Array): string {
  let binary = "";

  for (let start = 0; start < bytes.length; start += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(start, start + CHUNK));
  }

  return btoa(binary);
}
