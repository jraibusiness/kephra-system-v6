const fs = require('fs');
const path = require('path');

const F = (w) =>
  fs.readFileSync(path.join(__dirname, `node_modules/@fontsource/advent-pro/files/advent-pro-latin-${w}-normal.woff2`)).toString('base64');

const fontFaces = [300, 400, 500, 600]
  .map(
    (w) =>
      `@font-face{font-family:"Advent Pro";font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${F(w)}) format("woff2")}`
  )
  .join('\n');

const svg = (file, color) =>
  fs.readFileSync(path.join(__dirname, file), 'utf8').replace(/currentColor/g, color);
const dataUri = (s) => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');

const RED = '#E31D26';
const INK = '#1C1717';

module.exports = {
  fontFaces,
  RED,
  INK,
  logo: {
    red: dataUri(svg('logo.svg', RED)),
    white: dataUri(svg('logo.svg', '#FFFFFF')),
  },
  pot: {
    red: dataUri(svg('pot.svg', RED)),
    white: dataUri(svg('pot.svg', '#FFFFFF')),
    tint: dataUri(svg('pot.svg', '#F7E3E3')),
    redSoft: dataUri(svg('pot.svg', 'rgba(255,255,255,0.09)')),
  },
  brl: (n) => 'R$ ' + n.toLocaleString('pt-BR') + ',00',
};
