// Génère le PDF du CV (aperçu ET téléchargement passent par ici : ce que l'on
// voit est exactement ce que l'on télécharge). Avec meta.autoFit, resserre
// progressivement espacements puis taille du texte jusqu'à tenir sur une page.
import { pdf } from '@react-pdf/renderer';
import { ResumeDocument } from './ResumeDocument';
import { FIT_STEPS } from './resumeTheme';

// pdfkit écrit chaque page comme un dictionnaire « /Type /Page » non compressé.
export function countPdfPages(buffer) {
  const text = new TextDecoder('latin1').decode(buffer);
  return (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
}

async function renderOnce(cvData, fit) {
  const blob = await pdf(<ResumeDocument cvData={cvData} fit={fit} />).toBlob();
  const buffer = await blob.arrayBuffer();
  return { blob, buffer, pages: countPdfPages(buffer) };
}

/**
 * @returns {Promise<{ blob: Blob, buffer: ArrayBuffer, pages: number, fitLevel: number, fitted: boolean }>}
 *   fitLevel : palier d'ajustement appliqué (0 = mise en page d'origine).
 */
export async function renderResume(cvData, { autoFit = cvData?.meta?.autoFit !== false } = {}) {
  const first = await renderOnce(cvData, FIT_STEPS[0]);
  // Au-delà de 2 pages, compresser rendrait le CV illisible : on garde l'original.
  if (!autoFit || first.pages <= 1 || first.pages > 2) {
    return { ...first, fitLevel: 0, fitted: false };
  }
  for (let level = 1; level < FIT_STEPS.length; level += 1) {
    const res = await renderOnce(cvData, FIT_STEPS[level]);
    if (res.pages <= 1) return { ...res, fitLevel: level, fitted: true };
  }
  return { ...first, fitLevel: 0, fitted: false };
}
