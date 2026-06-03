// Orchestrateur du parsing : PDF → texte (local) → Gemini → JSON normalisé conforme.
import { extractPdfText, LOW_TEXT_THRESHOLD } from './pdfExtract';
import { generateJSON } from './geminiClient';
import { buildParsePrompt } from './prompts';
import { normalizeParsedCV } from './cvSchema';

/**
 * @param {File} file  fichier PDF
 * @param {{ apiKey?: string, onProgress?: (step: string) => void }} [opts]
 * @returns {Promise<{ cv: object, meta: { pages: number, lowText: boolean } }>}
 */
export async function parseResumeFromPdf(file, { apiKey, onProgress } = {}) {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Merci de fournir un fichier PDF.');
  }

  onProgress?.('extract');
  const { text, pages, charsPerPage } = await extractPdfText(file);
  if (!text) {
    throw new Error("Aucun texte extractible. Le PDF est probablement scanné ou en image.");
  }
  const lowText = charsPerPage < LOW_TEXT_THRESHOLD;

  onProgress?.('analyze');
  const raw = await generateJSON({ prompt: buildParsePrompt(text), apiKey });

  onProgress?.('structure');
  const cv = normalizeParsedCV(raw);

  if (import.meta.env.DEV) {
    console.groupCollapsed('[Profila AI] parsing debug');
    console.log('Texte PDF extrait (longueur):', text.length, '| pages:', pages, '| lowText:', lowText);
    console.log('Aperçu texte:', text.slice(0, 600));
    console.log('JSON brut Gemini:', raw);
    console.log('CV normalisé:', cv);
    console.groupEnd();
  }

  return { cv, meta: { pages, lowText } };
}
