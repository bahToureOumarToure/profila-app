// Enregistrement unique de la police Inter pour tous les templates PDF.
import { Font } from '@react-pdf/renderer';
import interRegular from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import interMedium from '@fontsource/inter/files/inter-latin-500-normal.woff?url';
import interSemiBold from '@fontsource/inter/files/inter-latin-600-normal.woff?url';
import interBold from '@fontsource/inter/files/inter-latin-700-normal.woff?url';

let done = false;
function registerPdfFonts() {
  if (done) return;
  done = true;
  Font.register({
    family: 'Inter',
    fonts: [
      { src: interRegular, fontWeight: 'normal' },
      { src: interMedium, fontWeight: 500 },
      { src: interSemiBold, fontWeight: 600 },
      { src: interBold, fontWeight: 'bold' },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}

registerPdfFonts();

// Regroupe les compétences par catégorie (ordre d'apparition préservé).
export function groupSkills(skills = []) {
  const groups = [];
  const index = {};
  skills.forEach((s) => {
    const name = (s.name || '').trim();
    if (!name) return;
    const cat = (s.category || '').trim() || 'Autres';
    if (!(cat in index)) { index[cat] = groups.length; groups.push({ cat, items: [] }); }
    groups[index[cat]].items.push(name);
  });
  return groups;
}
