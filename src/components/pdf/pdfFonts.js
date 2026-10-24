// Polices embarquées dans le PDF (OFL). Fichiers WOFF du sous-ensemble latin
// (accents français inclus) ; chaque fichier n'est téléchargé que si la police
// est utilisée. Le texte reste vectoriel et extractible par les ATS.
import { Font } from '@react-pdf/renderer';

import interRegular from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import interItalic from '@fontsource/inter/files/inter-latin-400-italic.woff?url';
import interBold from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import interBoldItalic from '@fontsource/inter/files/inter-latin-700-italic.woff?url';

import serifRegular from '@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff?url';
import serifItalic from '@fontsource/source-serif-4/files/source-serif-4-latin-400-italic.woff?url';
import serifBold from '@fontsource/source-serif-4/files/source-serif-4-latin-700-normal.woff?url';
import serifBoldItalic from '@fontsource/source-serif-4/files/source-serif-4-latin-700-italic.woff?url';

import carlitoRegular from '@fontsource/carlito/files/carlito-latin-400-normal.woff?url';
import carlitoItalic from '@fontsource/carlito/files/carlito-latin-400-italic.woff?url';
import carlitoBold from '@fontsource/carlito/files/carlito-latin-700-normal.woff?url';
import carlitoBoldItalic from '@fontsource/carlito/files/carlito-latin-700-italic.woff?url';

import latoRegular from '@fontsource/lato/files/lato-latin-400-normal.woff?url';
import latoItalic from '@fontsource/lato/files/lato-latin-400-italic.woff?url';
import latoBold from '@fontsource/lato/files/lato-latin-700-normal.woff?url';
import latoBoldItalic from '@fontsource/lato/files/lato-latin-700-italic.woff?url';

import robotoRegular from '@fontsource/roboto/files/roboto-latin-400-normal.woff?url';
import robotoItalic from '@fontsource/roboto/files/roboto-latin-400-italic.woff?url';
import robotoBold from '@fontsource/roboto/files/roboto-latin-700-normal.woff?url';
import robotoBoldItalic from '@fontsource/roboto/files/roboto-latin-700-italic.woff?url';

const FAMILIES = {
  'Inter':          [interRegular, interItalic, interBold, interBoldItalic],
  'Source Serif 4': [serifRegular, serifItalic, serifBold, serifBoldItalic],
  'Carlito':        [carlitoRegular, carlitoItalic, carlitoBold, carlitoBoldItalic],
  'Lato':           [latoRegular, latoItalic, latoBold, latoBoldItalic],
  'Roboto':         [robotoRegular, robotoItalic, robotoBold, robotoBoldItalic],
};

// Taille de corps (pt) qui donne une hauteur visuelle équivalente selon la police :
// Inter est large, Carlito (Calibri) est petite.
export const FONT_BODY_SIZE = {
  'Inter':          9,
  'Source Serif 4': 9.6,
  'Carlito':        10.4,
  'Lato':           9.6,
  'Roboto':         9.2,
};

export const PDF_FONT_FAMILIES = Object.keys(FAMILIES);

let done = false;
function registerPdfFonts() {
  if (done) return;
  done = true;
  Object.entries(FAMILIES).forEach(([family, [regular, italic, bold, boldItalic]]) => {
    Font.register({
      family,
      fonts: [
        { src: regular, fontWeight: 400 },
        { src: italic, fontWeight: 400, fontStyle: 'italic' },
        { src: bold, fontWeight: 700 },
        { src: boldItalic, fontWeight: 700, fontStyle: 'italic' },
      ],
    });
  });
  // Pas de césure : les mots-clés restent entiers (lisibilité + extraction ATS).
  Font.registerHyphenationCallback((word) => [word]);
}

registerPdfFonts();
