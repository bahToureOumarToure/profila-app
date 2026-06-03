// Validation/normalisation de la sortie d'audit (offre + compatibilité).
// Garde-fou : on ne fait jamais confiance à la sortie brute du LLM.
const str = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v));
const clamp100 = (v) => {
  const n = Math.round(Number(v));
  return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
};
const arrStr = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

export function normalizeJobAudit(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Format de données IA inattendu.');
  const job = raw.job || {};
  const audit = raw.audit || {};
  const b = audit.breakdown || {};

  return {
    job: {
      title: str(job.title),
      company: str(job.company),
      seniority: str(job.seniority),
      hardSkills: arrStr(job.hardSkills),
      softSkills: arrStr(job.softSkills),
      keywords: arrStr(job.keywords),
    },
    audit: {
      score: clamp100(audit.score),
      breakdown: {
        hardSkills: clamp100(b.hardSkills),
        softSkills: clamp100(b.softSkills),
        keywords: clamp100(b.keywords),
        seniority: clamp100(b.seniority),
      },
      matched: arrStr(audit.matched),
      reformulate: Array.isArray(audit.reformulate)
        ? audit.reformulate
            .map((r) => ({ keyword: str(r.keyword), found_in: str(r.found_in), suggestion: str(r.suggestion) }))
            .filter((r) => r.keyword)
        : [],
      missing: Array.isArray(audit.missing)
        ? audit.missing
            .map((m) => ({
              keyword: str(m.keyword),
              severity: ['high', 'medium', 'low'].includes(m.severity) ? m.severity : 'medium',
              advice: str(m.advice),
            }))
            .filter((m) => m.keyword)
        : [],
      recommendations: arrStr(audit.recommendations),
    },
  };
}
