import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { renderResume, countPdfPages } from '../renderResume';
import sampleCV from '@data/sampleCV';
import { CV_TEMPLATES } from '@data/initialCVData';
import { migrateCV } from '@data/migrateCV';

// PROFILA_PDF_OUT=dossier npm test → écrit les PDF générés pour inspection visuelle.
function dump(name, buffer) {
  const dir = process.env.PROFILA_PDF_OUT;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.pdf`), Buffer.from(buffer));
}

async function extract(buffer) {
  const doc = await getDocument({ data: new Uint8Array(buffer.slice(0)), useSystemFonts: false }).promise;
  let text = '';
  const links = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str + (it.hasEOL ? '\n' : '')).join('');
    const annots = await page.getAnnotations();
    annots.filter((a) => a.subtype === 'Link').forEach((a) => links.push(a.url));
  }
  const meta = await doc.getMetadata();
  return { text, links, pages: doc.numPages, info: meta.info };
}

// Photo 8×8 px (PNG) pour vérifier l'intégration de l'image.
const PHOTO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGNgGAWjYBSMAggAAAQQAAGFP6pyAAAAAElFTkSuQmCC';

describe.each(CV_TEMPLATES)('template $id', ({ id: template, defaultFont, defaultColor }) => {
  const cv = migrateCV({
    ...sampleCV,
    personalInfo: { ...sampleCV.personalInfo, photo: PHOTO },
    meta: { ...sampleCV.meta, template, fontFamily: defaultFont, colorScheme: { primary: defaultColor } },
  });

  it('tient sur une page avec texte extractible, liens cliquables et métadonnées', async () => {
    const res = await renderResume(cv);
    dump(`template-${template}`, res.buffer);
    expect(res.pages).toBe(1);
    // CV dense d'élève-ingénieur : tient sur une page avec une compression légère
    // (palier ≤ 3 : texte à 93 % minimum).
    expect(res.fitLevel).toBeLessThanOrEqual(3);
    const { text, links, pages, info } = await extract(res.buffer);
    expect(pages).toBe(res.pages);

    // Certains templates impriment les titres en capitales : comparaison insensible à la casse.
    const flat = text.replace(/\s+/g, ' ').toLowerCase();
    for (const needle of [
      'Amine Bennani', 'amine.bennani@example.com', '+212 6 00 00 00 00', 'Casablanca, Maroc',
      'Profil professionnel', 'Formation', 'Expérience professionnelle', 'Compétences techniques',
      'NBS Consulting', 'Spring Cloud', 'Langages', 'Recherche de stage PFE',
      'linkedin.com/in/amine-bennani-exemple', 'github.com/amine-bennani-exemple',
    ]) {
      expect(flat).toContain(needle.toLowerCase());
    }
    // Ordre de lecture = ordre des sections (une seule colonne).
    expect(flat.indexOf('profil professionnel')).toBeLessThan(flat.indexOf('formation'));
    expect(flat.indexOf('formation')).toBeLessThan(flat.indexOf('expérience professionnelle'));
    expect(flat).not.toContain('**');

    expect(links).toEqual(expect.arrayContaining([
      'mailto:amine.bennani@example.com',
      'https://www.linkedin.com/in/amine-bennani-exemple',
      'https://github.com/amine-bennani-exemple',
      'https://amine-bennani.example.dev/',
    ]));
    expect(info.Title).toContain('Amine Bennani');
    expect(info.Keywords).toContain('Spring Boot');
  });
});

describe('renderResume', () => {
  it('compte les pages et ajuste un CV trop long sur une page', async () => {
    const long = migrateCV({
      ...sampleCV,
      projects: [...sampleCV.projects, { ...sampleCV.projects[0], id: 'proj-extra' }],
    });
    const noFit = await renderResume(long, { autoFit: false });
    dump('long-nofit', noFit.buffer);
    expect(noFit.pages).toBe(2);
    expect(countPdfPages(noFit.buffer)).toBe(2);

    const fitted = await renderResume(long, { autoFit: true });
    dump('long-fitted', fitted.buffer);
    expect(fitted.pages).toBe(1);
    expect(fitted.fitted).toBe(true);
    expect(fitted.fitLevel).toBeGreaterThan(0);
  });

  it("masque les sections cachées et applique les titres personnalisés", async () => {
    const cv = migrateCV({
      ...sampleCV,
      meta: { ...sampleCV.meta, hiddenSections: ['interests'], sectionTitles: { achievements: 'Algorithmique' } },
    });
    const { text } = await extract((await renderResume(cv)).buffer);
    expect(text).not.toContain("Centres d'intérêt");
    expect(text).toContain('Algorithmique');
  });

  it("rend un CV vide sans erreur", async () => {
    const res = await renderResume(migrateCV({}));
    expect(res.pages).toBe(1);
  });
});
