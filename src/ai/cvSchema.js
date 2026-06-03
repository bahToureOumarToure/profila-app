// Garde-fou : on ne fait JAMAIS confiance à la sortie brute du LLM.
// Ce module valide/normalise le JSON de Gemini vers la forme EXACTE attendue par
// loadCV() / initialCVData, et injecte les `id` (uuid) requis par les listes drag & drop.
import { v4 as uuid } from 'uuid';
import { LANGUAGE_LEVELS } from '@data/initialCVData';

const str = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v));
const bool = (v) => v === true || v === 'true';

function normDate(v) {
  const s = str(v);
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) return s;            // YYYY-MM
  if (/^\d{4}$/.test(s)) return s;                              // YYYY
  const my = s.match(/^(\d{1,2})[-/.](\d{4})$/);               // MM/YYYY
  if (my) return `${my[2]}-${String(my[1]).padStart(2, '0')}`;
  const ym = s.match(/^(\d{4})[-/.](\d{1,2})$/);               // YYYY/MM
  if (ym) return `${ym[1]}-${String(ym[2]).padStart(2, '0')}`;
  return '';
}

function clampLevel(v) {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return 3;
  return Math.min(5, Math.max(1, n));
}

function normLangLevel(v) {
  const s = str(v);
  return LANGUAGE_LEVELS.includes(s) ? s : 'Courant (C1/C2)';
}

const arr = (v, mapFn) => (Array.isArray(v) ? v.map(mapFn).filter(Boolean) : []);
const withId = (obj) => ({ id: uuid(), ...obj });

/**
 * Normalise la sortie brute de l'IA en données CV propres (partielles).
 * Ne renvoie que les sections présentes ; loadCV fusionnera avec initialCVData.
 */
export function normalizeParsedCV(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error("Format de données IA inattendu.");
  }
  const p = raw.personalInfo || {};

  const out = {
    personalInfo: {
      firstName: str(p.firstName),
      lastName: str(p.lastName),
      title: str(p.title),
      email: str(p.email),
      phone: str(p.phone),
      location: str(p.location),
      website: str(p.website),
      linkedin: str(p.linkedin),
      github: str(p.github),
      photo: '',
      summary: str(p.summary),
    },
    experiences: arr(raw.experiences, (e) =>
      withId({
        company: str(e.company),
        position: str(e.position),
        startDate: normDate(e.startDate),
        endDate: normDate(e.endDate),
        current: bool(e.current),
        location: str(e.location),
        description: str(e.description),
      })),
    education: arr(raw.education, (e) =>
      withId({
        school: str(e.school),
        degree: str(e.degree),
        field: str(e.field),
        startDate: normDate(e.startDate),
        endDate: normDate(e.endDate),
        description: str(e.description),
      })),
    skills: arr(raw.skills, (s) =>
      str(s.name) ? withId({ name: str(s.name), level: clampLevel(s.level), category: str(s.category) }) : null),
    languages: arr(raw.languages, (l) =>
      str(l.name) ? withId({ name: str(l.name), level: normLangLevel(l.level) }) : null),
    projects: arr(raw.projects, (pr) =>
      str(pr.name) ? withId({
        name: str(pr.name), description: str(pr.description),
        url: str(pr.url), technologies: str(pr.technologies),
      }) : null),
    certifications: arr(raw.certifications, (c) =>
      str(c.name) ? withId({
        name: str(c.name), issuer: str(c.issuer), date: normDate(c.date),
        expiryDate: normDate(c.expiryDate), credentialId: str(c.credentialId), url: str(c.url),
      }) : null),
    interests: arr(raw.interests, (i) =>
      str(i.name) ? withId({ name: str(i.name), category: str(i.category) || 'Autre', description: str(i.description) }) : null),
  };

  return out;
}

/** Résumé lisible pour l'écran de validation. */
export function summarizeParsedCV(cv) {
  const name = `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`.trim();
  return {
    name: name || '(nom non détecté)',
    title: cv.personalInfo.title,
    counts: {
      experiences: cv.experiences.length,
      education: cv.education.length,
      skills: cv.skills.length,
      languages: cv.languages.length,
      projects: cv.projects.length,
      certifications: cv.certifications.length,
    },
  };
}
