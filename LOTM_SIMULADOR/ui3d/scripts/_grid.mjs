import sharp from 'sharp';
const [,, src, out, x0=0, y0=0, w=1920, h=1080, step=100] = process.argv;
const X0=+x0,Y0=+y0,W=+w,H=+h,ST=+step;
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
for(let x=Math.ceil(X0/ST)*ST;x<X0+W;x+=ST){svg+=`<line x1="${x-X0}" y1="0" x2="${x-X0}" y2="${H}" stroke="#0ff" stroke-opacity="0.55" stroke-width="1"/><text x="${x-X0+2}" y="14" fill="#0ff" font-size="13" font-family="Arial">${x}</text>`}
for(let y=Math.ceil(Y0/ST)*ST;y<Y0+H;y+=ST){svg+=`<line x1="0" y1="${y-Y0}" x2="${W}" y2="${y-Y0}" stroke="#ff0" stroke-opacity="0.55" stroke-width="1"/><text x="2" y="${y-Y0-2}" fill="#ff0" font-size="13" font-family="Arial">${y}</text>`}
svg+='</svg>';
await sharp(src).resize(1920,1080).extract({left:X0,top:Y0,width:W,height:H}).composite([{input:Buffer.from(svg)}]).png().toFile(out);
