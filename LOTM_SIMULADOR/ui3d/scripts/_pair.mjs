// Une capturas en horizontal para comparar: node scripts/_pair.mjs <out.png> <alto> <a.png> <b.png> [...]
import sharp from 'sharp';
const [,, out, h, ...inputs] = process.argv;
const imgs = await Promise.all(inputs.map((f) => sharp(f).resize({ height: +h }).toBuffer({ resolveWithObject: true })));
const width = imgs.reduce((w, i) => w + i.info.width + 16, -16);
let x = 0;
const composite = imgs.map((i) => { const c = { input: i.data, left: x, top: 0 }; x += i.info.width + 16; return c; });
await sharp({ create: { width, height: +h, channels: 3, background: '#000' } }).composite(composite).png().toFile(out);
