import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

// Decode the actual supplied artwork, rather than testing texture-loading stubs.
function decodePNG(file) {
  assert.equal(file.subarray(1, 4).toString(), 'PNG');
  const width = file.readUInt32BE(16), height = file.readUInt32BE(20);
  assert.equal(file[24], 8, '8-bit channels');
  assert.equal(file[25], 6, 'RGBA transparency is present');
  assert.equal(file[28], 0, 'non-interlaced PNG');
  const chunks = [];
  for (let offset = 8; offset < file.length;) {
    const length = file.readUInt32BE(offset), type = file.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(file.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const input = inflateSync(Buffer.concat(chunks)), data = new Uint8ClampedArray(width * height * 4), stride = width * 4;
  let cursor = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = input[cursor++]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= 4 ? data[i - 4] : 0, b = y ? data[i - stride] : 0, c = y && x >= 4 ? data[i - stride - 4] : 0;
      const predict = filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a + b) / 2) : filter === 4 ? paeth(a, b, c) : 0;
      data[i] = (input[cursor++] + predict) & 255;
    }
  }
  return { width, height, data };
}
const source = (await readFile(new URL('../characters.js', import.meta.url), 'utf8')).replace('import * as THREE from "three";', '').replaceAll('export ', '');
const { CHARACTER_ART, measureFrame } = vm.runInNewContext(source + '\n;({CHARACTER_ART, measureFrame})');
assert.equal(CHARACTER_ART.length, 12);
const actors = new Set();
for (const key of CHARACTER_ART) {
  const file = await readFile(new URL(`../assets/characters/${key}-walk.png`, import.meta.url));
  actors.add(createHash('sha256').update(file).digest('hex'));
  const image = decodePNG(file);
  assert.ok(image.width >= 1024 && image.height >= 1024, `${key}: sufficient source resolution`);
  const hashes = new Set();
  for (let i = 0; i < 8; i++) {
    const x = Math.round(i % 4 * image.width / 4), y = Math.round(Math.floor(i / 4) * image.height / 2);
    const width = Math.round((i % 4 + 1) * image.width / 4) - x, height = Math.round((Math.floor(i / 4) + 1) * image.height / 2) - y;
    const pixels = new Uint8ClampedArray(width * height * 4);
    for (let row = 0; row < height; row++) pixels.set(image.data.subarray(((y + row) * image.width + x) * 4, ((y + row) * image.width + x + width) * 4), row * width * 4);
    const bounds = measureFrame(pixels, width, height);
    assert.ok(bounds.maxY - bounds.minY > height * .75, `${key} frame ${i}: full-height actor`);
    assert.ok(bounds.minY > 0 && bounds.maxY < height - 1, `${key} frame ${i}: uncropped head and soles`);
    let opaque = 0, transparent = 0;
    for (let p = 3; p < pixels.length; p += 4) { if (pixels[p] > 128) opaque++; if (pixels[p] === 0) transparent++; }
    assert.ok(opaque > width * height * .15, `${key} frame ${i}: visible connected character`);
    assert.ok(transparent > width * height * .12, `${key} frame ${i}: transparent surrounding space`);
    hashes.add(createHash('sha256').update(pixels).digest('hex'));
  }
  assert.ok(hashes.size >= 6, `${key}: distinct animation frames`);
}
assert.equal(actors.size, 12, 'every actor has individual artwork');
console.log('Passed: all twelve RGBA PNG atlases decode, 96 uncropped character frames, connected silhouettes, transparent backgrounds, sufficient resolution, and distinct animation artwork.');
