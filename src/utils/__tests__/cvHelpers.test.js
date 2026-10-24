import { describe, it, expect } from 'vitest';
import {
  formatDateRange, formatMonthYear, parseDescription, parseInlineBold, prettyUrl, normalizeUrl,
  formatLanguageLevel, resolveSectionOrder, sectionTitle, telHref,
} from '../cvHelpers';
import { analyzeATS } from '../atsCheck';
import { migrateCV } from '@data/migrateCV';
import sampleCV from '@data/sampleCV';
import { DEFAULT_SECTION_ORDER } from '@data/initialCVData';

describe('dates', () => {
  it('formate selon le style choisi', () => {
    expect(formatMonthYear('2026-07')).toBe('Juillet 2026');
    expect(formatMonthYear('2026-07', 'short')).toBe('Juil. 2026');
    expect(formatMonthYear('2026-07', 'numeric')).toBe('07/2026');
    expect(formatMonthYear('2026')).toBe('2026');
    expect(formatMonthYear('n/a')).toBe('');
    expect(formatDateRange('2023', '2027')).toBe('2023 – 2027');
    expect(formatDateRange('2025-06', '', true)).toBe('Juin 2025 – Présent');
    expect(formatDateRange('', '2027')).toBe('2027');
    expect(formatDateRange('2024-03', '2024-03')).toBe('Mars 2024');
  });
});

describe('descriptions en puces', () => {
  it('transforme les lignes en puces et retire les marqueurs', () => {
    expect(parseDescription('- A\n• B\n* C\n1. D')).toEqual({ paragraph: '', bullets: ['A', 'B', 'C', 'D'] });
    expect(parseDescription('Une seule phrase.')).toEqual({ paragraph: 'Une seule phrase.', bullets: [] });
    expect(parseDescription('Ligne 1\nLigne 2')).toEqual({ paragraph: '', bullets: ['Ligne 1', 'Ligne 2'] });
    expect(parseDescription('Contexte :\n- A\n- B')).toEqual({ paragraph: 'Contexte :', bullets: ['A', 'B'] });
    expect(parseDescription('')).toEqual({ paragraph: '', bullets: [] });
  });

  it('découpe le gras **…**', () => {
    expect(parseInlineBold('via **Docker** et **K8s**.')).toEqual([
      { text: 'via ', bold: false }, { text: 'Docker', bold: true }, { text: ' et ', bold: false },
      { text: 'K8s', bold: true }, { text: '.', bold: false },
    ]);
    expect(parseInlineBold('5 * 3 **')).toEqual([{ text: '5 * 3 **', bold: false }]);
  });
});

describe('liens', () => {
  it('normalise et embellit', () => {
    expect(normalizeUrl('github.com/moi')).toBe('https://github.com/moi');
    expect(normalizeUrl('http://x.dev')).toBe('http://x.dev');
    expect(prettyUrl('https://www.linkedin.com/in/moi/')).toBe('linkedin.com/in/moi');
    expect(prettyUrl('https://bahoumartoure.vercel.app/')).toBe('bahoumartoure.vercel.app');
    expect(telHref('+212 6 00 00 00 00')).toBe('tel:+212600000000');
  });
});

describe('sections', () => {
  it('complète l’ordre, dédoublonne et applique les titres personnalisés', () => {
    const order = resolveSectionOrder({ sectionOrder: ['skills', 'skills', 'bogus'] }, DEFAULT_SECTION_ORDER);
    expect(order[0]).toBe('skills');
    expect(order).toHaveLength(DEFAULT_SECTION_ORDER.length);
    expect(sectionTitle({ sectionTitles: { skills: 'Stack' } }, 'skills')).toBe('Stack');
    expect(sectionTitle({ sectionTitles: { skills: '  ' } }, 'skills')).toBe('Compétences techniques');
    expect(formatLanguageLevel('Courant (C1/C2)')).toBe('courant, C1/C2');
  });
});

describe('migrateCV', () => {
  it('met à niveau un ancien CV', () => {
    const old = migrateCV({
      meta: { template: 'modern', fontFamily: 'Playfair Display', colorScheme: { primary: '#123456' } },
      personalInfo: { firstName: 'A', summary: null },
      experiences: [{ company: 'X' }],
      projects: 'pas un tableau',
    });
    expect(old.meta.fontFamily).toBe('Source Serif 4');
    expect(old.meta.density).toBe('normal');
    expect(old.meta.autoFit).toBe(true);
    expect(old.personalInfo.availability).toBe('');
    expect(old.personalInfo.summary).toBe('');
    expect(old.experiences[0]).toMatchObject({ company: 'X', technologies: '', current: false });
    expect(old.experiences[0].id).toBeTruthy();
    expect(old.projects).toEqual([]);
    expect(migrateCV({ meta: { template: '???' } }).meta.template).toBe('ats');
  });
});

describe('analyzeATS', () => {
  it('donne un bon score au CV exemple', () => {
    const { score, counts } = analyzeATS(migrateCV(sampleCV), { pages: 1 });
    expect(counts.error).toBe(0);
    expect(score).toBeGreaterThanOrEqual(85);
  });

  it('signale les problèmes majeurs', () => {
    const cv = migrateCV({
      ...sampleCV,
      personalInfo: { ...sampleCV.personalInfo, email: 'pas-un-email', summary: 'Étudiant passionné et dynamique.' },
      experiences: [{ id: 'e', company: 'ACME', position: 'Dev', startDate: '2025-05', endDate: '2025-01', description: 'Participation au projet' }],
      meta: { ...sampleCV.meta, sectionTitles: { experiences: 'Mon aventure' } },
    });
    const { checks, score } = analyzeATS(cv, { pages: 2 });
    const msgs = checks.map((c) => c.message).join('\n');
    expect(msgs).toContain('e-mail semble invalide');
    expect(msgs).toContain('date de fin précède');
    expect(msgs).toContain('passionné');
    expect(msgs).toContain('2 pages');
    expect(msgs).toContain('peu standard');
    expect(checks[0].level).toBe('error');
    expect(score).toBeLessThan(70);
  });

  it("accepte une fin en année seule et signale une date incomplète", () => {
    const base = migrateCV(sampleCV);
    const ok = analyzeATS({ ...base, experiences: [{ ...base.experiences[0], startDate: '2025-06', endDate: '2025' }] });
    expect(ok.checks.map((c) => c.message).join()).not.toContain('précède');
    const partial = analyzeATS({ ...base, experiences: [{ ...base.experiences[0], startDate: '202-05' }] });
    expect(partial.checks.map((c) => c.message).join()).toContain('incomplètes');
  });
});
