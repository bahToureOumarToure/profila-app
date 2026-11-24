import { describe, it, expect } from 'vitest';
import {
  cefrRange, formatCefr, cefrDescriptor, parseLanguageLevel, normalizeLanguage,
  formatLanguageLevel, hasLanguageLevel,
} from '../languageLevel';

describe('niveaux CECRL', () => {
  it('ordonne et formate une plage ou un niveau unique', () => {
    expect(cefrRange('B1', 'A2')).toEqual(['A2', 'B1']);
    expect(cefrRange('b2', '')).toEqual(['B2', 'B2']);
    expect(cefrRange('X9', '')).toEqual(['', '']);
    expect(formatCefr('A2', 'B1')).toBe('A2/B1');
    expect(formatCefr('B2', 'B2')).toBe('B2');
    expect(formatCefr('', '')).toBe('');
  });

  it('déduit un qualificatif', () => {
    expect(cefrDescriptor('C1', 'C2')).toBe('courant');
    expect(cefrDescriptor('B1', 'B2')).toBe('intermédiaire');
    expect(cefrDescriptor('A2', 'B1')).toBe('pré-intermédiaire');
    expect(cefrDescriptor('B2', 'C1')).toBe('avancé');
    expect(cefrDescriptor('A1', 'A1')).toBe('débutant');
    expect(cefrDescriptor('B2', 'B2')).toBe('avancé');
  });

  it('lit les anciens niveaux et les formulations libres', () => {
    expect(parseLanguageLevel('Courant (C1/C2)')).toEqual({ nativeLevel: '', cefrMin: 'C1', cefrMax: 'C2' });
    expect(parseLanguageLevel('Langue maternelle')).toEqual({ nativeLevel: 'Langue maternelle', cefrMin: '', cefrMax: '' });
    expect(parseLanguageLevel('bilingue')).toEqual({ nativeLevel: 'Bilingue', cefrMin: '', cefrMax: '' });
    expect(parseLanguageLevel('entre A2 et B1')).toEqual({ nativeLevel: '', cefrMin: 'A2', cefrMax: 'B1' });
    expect(parseLanguageLevel('intermédiaire')).toEqual({ nativeLevel: '', cefrMin: 'B1', cefrMax: 'B2' });
    expect(parseLanguageLevel('')).toEqual({ nativeLevel: '', cefrMin: '', cefrMax: '' });
  });
});

describe('affichage', () => {
  const lang = (o) => normalizeLanguage({ name: 'X', ...o });

  it('écrit le niveau sans parenthèses, avec précision facultative', () => {
    expect(formatLanguageLevel(lang({ cefrMin: 'C1', cefrMax: 'C2' }))).toBe('courant – C1/C2');
    expect(formatLanguageLevel(lang({ cefrMin: 'A2', cefrMax: 'B1', note: 'bonne compréhension écrite' })))
      .toBe('pré-intermédiaire – A2/B1, bonne compréhension écrite');
    expect(formatLanguageLevel(lang({ nativeLevel: 'Langue maternelle', cefrMin: 'C2', cefrMax: 'C2' }))).toBe('langue maternelle');
    expect(formatLanguageLevel(lang({ cefrMin: 'B2', cefrMax: 'B2', label: 'professionnel' }))).toBe('professionnel – B2');
    expect(formatLanguageLevel(lang({ cefrMin: 'A2', cefrMax: 'B1', label: 'none', note: 'en progression' }))).toBe('A2/B1, en progression');
    expect(formatLanguageLevel(lang({}))).toBe('');
    expect(hasLanguageLevel(lang({}))).toBe(false);
    expect(hasLanguageLevel(lang({ nativeLevel: 'Bilingue' }))).toBe(true);
  });
});
