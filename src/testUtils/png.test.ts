/// <reference types="node" />
import fs from 'fs';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import { readTopCorners } from './png';

// Builds a 1-row, 3-pixel RGBA PNG using the given row filter. CRCs are left zero: the
// reader doesn't check them.
function writePng(filter: number, pixels: number[][]): string {
  const raw = pixels.flat();
  const encoded = raw.map((byte, i) => {
    const left = i >= 4 ? raw[i - 4] : 0;
    if (filter === 1 || filter === 4) return (byte - left) & 255;
    if (filter === 3) return (byte - (left >> 1)) & 255;
    return byte;
  });
  const chunk = (type: string, body: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(body.length);
    return Buffer.concat([length, Buffer.from(type, 'ascii'), body, Buffer.alloc(4)]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(pixels.length, 0);
  header.writeUInt32BE(1, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(Buffer.from([filter, ...encoded]))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'png-')), `f${filter}.png`);
  fs.writeFileSync(file, png);
  return file;
}

describe('readTopCorners', () => {
  const pixels = [
    [10, 20, 30, 0],
    [200, 150, 100, 255],
    [5, 250, 99, 128],
  ];

  it.each([0, 1, 2, 3, 4])('reads both corners from a first row using filter %i', (filter) => {
    const { topLeft, topRight } = readTopCorners(writePng(filter, pixels));

    expect(topLeft).toEqual({ r: 10, g: 20, b: 30, a: 0 });
    expect(topRight).toEqual({ r: 5, g: 250, b: 99, a: 128 });
  });

  it('refuses images that are not 8-bit RGBA', () => {
    expect(() => readTopCorners(path.join(__dirname, '../../assets/icon.png'))).toThrow(/RGBA/);
  });
});
