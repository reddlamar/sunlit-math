/// <reference types="node" />
import fs from 'fs';
import zlib from 'zlib';

export type Rgba = { r: number; g: number; b: number; a: number };

const BYTES_PER_PIXEL = 4;

/**
 * Reads the first row of an 8-bit RGBA PNG and returns its two corner pixels. Row 0 has
 * no row above it, so undoing its filter only needs the byte one pixel to the left:
 * None and Up leave the bytes as they are, Sub and Paeth add the left byte (Paeth's
 * predictor is always the left byte when the row above is zero), and Average adds half
 * of it. That is enough to inspect the top corners without a full PNG decoder.
 */
export function readTopCorners(file: string): { topLeft: Rgba; topRight: Rgba } {
  const data = fs.readFileSync(file);
  const width = data.readUInt32BE(16);
  const bitDepth = data[24];
  const colorType = data[25];
  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`${file} is not an 8-bit RGBA PNG (depth ${bitDepth}, type ${colorType})`);
  }

  const compressed: Buffer[] = [];
  for (let offset = 8; offset < data.length; ) {
    const length = data.readUInt32BE(offset);
    if (data.toString('ascii', offset + 4, offset + 8) === 'IDAT') {
      compressed.push(data.subarray(offset + 8, offset + 8 + length));
    }
    offset += 12 + length;
  }
  const rawRow = zlib.inflateSync(Buffer.concat(compressed)).subarray(0, 1 + width * BYTES_PER_PIXEL);
  const filter = rawRow[0];
  const row = Buffer.from(rawRow.subarray(1));
  for (let i = BYTES_PER_PIXEL; i < row.length; i++) {
    const left = row[i - BYTES_PER_PIXEL];
    if (filter === 1 || filter === 4) {
      row[i] = (row[i] + left) & 255;
    } else if (filter === 3) {
      row[i] = (row[i] + (left >> 1)) & 255;
    }
  }

  const pixelAt = (x: number): Rgba => ({
    r: row[x * BYTES_PER_PIXEL],
    g: row[x * BYTES_PER_PIXEL + 1],
    b: row[x * BYTES_PER_PIXEL + 2],
    a: row[x * BYTES_PER_PIXEL + 3],
  });
  return { topLeft: pixelAt(0), topRight: pixelAt(width - 1) };
}
