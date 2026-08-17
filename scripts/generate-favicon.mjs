// One-off generator for public app/favicon.ico. Rasterises the brand SVG
// (public/icon.svg) at the classic favicon sizes with sharp, then wraps the
// PNG frames in a hand-rolled ICO container — modern ICO readers accept
// PNG-compressed frames directly, so no BMP/DIB encoding is needed.
//
// Run again only if public/icon.svg changes: node scripts/generate-favicon.mjs
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SIZES = [16, 32, 48];
const SVG_PATH = path.join(process.cwd(), "public", "icon.svg");
const OUT_PATH = path.join(process.cwd(), "app", "favicon.ico");

function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset
    offset += buffer.length;
    dirEntries.push(entry);
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

const pngBuffers = await Promise.all(
  SIZES.map(async (size) => ({
    size,
    buffer: await sharp(SVG_PATH).resize(size, size).png().toBuffer(),
  })),
);

await writeFile(OUT_PATH, buildIco(pngBuffers));
console.log(`Wrote ${OUT_PATH} (${SIZES.join("x, ")}x px frames)`);
