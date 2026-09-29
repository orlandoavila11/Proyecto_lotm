import sharp from 'sharp';
const [,, src, out, l, t, w, h, scale = 1] = process.argv;
const buf = await sharp(src).resize(1920, 1080).png().toBuffer();
await sharp(await sharp(buf).extract({ left: +l, top: +t, width: +w, height: +h }).png().toBuffer())
  .resize(Math.round(w * scale), Math.round(h * scale), { kernel: 'lanczos3' }).png().toFile(out);
