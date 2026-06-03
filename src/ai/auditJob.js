// Orchestrateur de l'audit : CV (compacté) + texte d'offre → Gemini → {job, audit}.
import { generateJSON } from './geminiClient';
import { buildJobAuditPrompt } from './prompts';
import { normalizeJobAudit } from './jobSchema';

// Ne transmet que ce qui sert à l'audit (réduit les tokens, évite d'envoyer
// des données personnelles inutiles comme email/téléphone).
function compactCV(cv) {
  const p = cv.personalInfo || {};
  return JSON.stringify({
    title: p.title,
    summary: p.summary,
    experiences: (cv.experiences || []).map((e) => ({
      position: e.position, company: e.company, description: e.description,
    })),
    skills: (cv.skills || []).map((s) => s.name),
    projects: (cv.projects || []).map((pr) => ({
      name: pr.name, technologies: pr.technologies, description: pr.description,
    })),
    education: (cv.education || []).map((ed) => ({ degree: ed.degree, field: ed.field })),
    certifications: (cv.certifications || []).map((c) => c.name),
    languages: (cv.languages || []).map((l) => l.name),
  });
}

export function cvHasContent(cv) {
  return Boolean(
    cv?.personalInfo?.summary?.trim() ||
    (cv?.experiences || []).length ||
    (cv?.skills || []).length,
  );
}

export async function auditCvAgainstJob(cv, jobText, { apiKey } = {}) {
  const text = (jobText || '').trim();
  if (text.length < 30) {
    throw new Error("Colle le texte de l'offre d'emploi (au moins quelques lignes).");
  }
  const raw = await generateJSON({ prompt: buildJobAuditPrompt(compactCV(cv), text), apiKey });
  const result = normalizeJobAudit(raw);

  if (import.meta.env.DEV) {
    console.groupCollapsed('[Profila AI] job audit debug');
    console.log('JSON brut Gemini:', raw);
    console.log('Audit normalisé:', result);
    console.groupEnd();
  }

  return result;
}
