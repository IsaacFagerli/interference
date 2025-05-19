const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');

async function convertFont() {
  const fontPath = '/Users/isaacfagerli/Library/Fonts/Studio Pro/StudioPro-Regular.otf';
  const outputPath = path.join(__dirname, '../public/fonts/StudioPro-Regular.json');

  const font = await new Promise((resolve, reject) => {
    fontkit.open(fontPath, (err, font) => {
      if (err) reject(err);
      else resolve(font);
    });
  });

  const glyphs = {};
  for (let i = 32; i < 127; i++) {
    const char = String.fromCharCode(i);
    const glyph = font.glyphForCodePoint(i);
    glyphs[char] = {
      ha: glyph.advanceWidth,
      x_min: glyph.bbox.minX,
      x_max: glyph.bbox.maxX,
      o: glyph.path.toSVG()
    };
  }

  const fontData = {
    glyphs,
    familyName: font.familyName,
    ascender: font.ascent,
    descender: font.descent,
    underlinePosition: font.underlinePosition,
    underlineThickness: font.underlineThickness,
    boundingBox: font.bbox,
    resolution: 1000,
    original_font_information: font.names
  };

  fs.writeFileSync(outputPath, JSON.stringify(fontData, null, 2));
}

convertFont().catch(console.error); 