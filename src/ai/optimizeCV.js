// Orchestrateur d'optimisation ATS : CV + offre → suggestions de réécriture
// (résumé + descriptions d'expériences), mappées sur les id réels du CV.
import { generateJSON } from './geminiClient';
import { buildOptimizePrompt } from './prompts';

const str = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v));

function buildInput(cv) {
  return JSON.stringify({
    title: cv.personalInfo?.title || '',
    summary: cv.personalInfo?.summary || '',
    currentSkills: (cv.skills || []).map((s) => s.name),
    experiences: (cv.experiences || []).map((e, i) => ({
      index: i,
      position: e.position,
      company: e.company,
      description: e.description,
    })),
    projects: (cv.projects || []).map((p) => ({ name: p.name, technologies: p.technologies })),
    education: (cv.education || []).map((ed) => ({ degree: ed.degree, field: ed.field })),
  });
}

// Transforme la sortie brute en liste de suggestions applicables.
// Chaque suggestion cible soit le résumé, soit une expérience (par id réel).
export function normalizeOptimizations(raw, cv) {
  const suggestions = [];

  const s = raw?.summary;
  if (s) {
    const after = str(s.after);
    const before = str(s.before) || str(cv.personalInfo?.summary);
    if (after && after !== before) {
      suggestions.push({
        id: 'summary', target: 'summary', label: 'Résumé professionnel',
        before, after, rationale: str(s.rationale),
      });
    }
  }

  if (Array.isArray(raw?.experiences)) {
    raw.experiences.forEach((e) => {
      const idx = Number(e.index);
      const exp = cv.experiences?.[idx];
      if (!exp) return;
      const after = str(e.after);
      const before = str(e.before) || str(exp.description);
      if (!after || after === before) return;
      suggestions.push({
        id: `exp-${exp.id}`, target: 'experience', expId: exp.id,
        label: `Expérience : ${exp.position || '?'}${exp.company ? ` @ ${exp.company}` : ''}`,
        before, after, rationale: str(e.rationale),
      });
    });
  }

  if (Array.isArray(raw?.skillsToAdd)) {
    const existing = new Set((cv.skills || []).map((s) => str(s.name).toLowerCase()));
    raw.skillsToAdd.forEach((s) => {
      const name = str(s.name);
      const key = name.toLowerCase();
      if (!name || existing.has(key)) return;
      existing.add(key);
      const category = str(s.category) || 'Autres';
      suggestions.push({
        id: `skill-${key}`, target: 'skillAdd', skillName: name, skillCategory: category,
        label: `Compétence à ajouter : ${name}`,
        before: '-', after: `${name}${category ? `  ·  ${category}` : ''}`,
        rationale: str(s.rationale),
      });
    });
  }

  return suggestions;
}

export async function optimizeCvForJob(cv, jobText, { apiKey } = {}) {
  const text = (jobText || '').trim();
  if (text.length < 30) {
    throw new Error("Colle le texte de l'offre d'emploi (au moins quelques lignes).");
  }
  const raw = await generateJSON({ prompt: buildOptimizePrompt(buildInput(cv), text), apiKey });
  const suggestions = normalizeOptimizations(raw, cv);

  if (import.meta.env.DEV) {
    console.groupCollapsed('[Profila AI] optimize debug');
    console.log('JSON brut Gemini:', raw);
    console.log('Suggestions:', suggestions);
    console.groupEnd();
  }

  return suggestions;
}
