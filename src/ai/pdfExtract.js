// Extraction du texte brut d'un PDF, 100 % côté navigateur (pdfjs-dist).
// Aucune donnée ne sort de la machine à cette étape.
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Extrait le texte d'un fichier PDF.
 * @param {File|ArrayBuffer} input
 * @returns {Promise<{ text: string, pages: number, charsPerPage: number }>}
 */
export async function extractPdfText(input) {
  const data = input instanceof ArrayBuffer ? input : await input.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Reconstruit les lignes en insérant un saut quand la position Y change nettement.
    let lastY = null;
    for (const item of content.items) {
      const y = item.transform?.[5];
      if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 4) text += '\n';
      text += item.str + (item.hasEOL ? '\n' : ' ');
      if (y !== undefined) lastY = y;
    }
    text += '\n';
  }

  const clean = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  const charsPerPage = pdf.numPages ? Math.round(clean.length / pdf.numPages) : 0;

  return { text: clean, pages: pdf.numPages, charsPerPage };
}

// Heuristique : sous ce seuil de caractères/page, le PDF est probablement
// vectorisé ou scanné → le texte n'est pas extractible de façon fiable.
export const LOW_TEXT_THRESHOLD = 120;
