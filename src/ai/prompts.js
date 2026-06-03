// Prompt de parsing : transforme le texte brut d'un CV en JSON conforme au
// modèle de données Profila (cf. src/data/initialCVData.js).
export function buildParsePrompt(resumeText) {
  return `Tu es un expert en analyse de CV. À partir du TEXTE BRUT d'un CV ci-dessous,
extrais les informations et renvoie UNIQUEMENT un objet JSON valide (aucun texte autour,
pas de Markdown) respectant EXACTEMENT cette structure :

{
  "personalInfo": {
    "firstName": "", "lastName": "", "title": "", "email": "", "phone": "",
    "location": "", "website": "", "linkedin": "", "github": "", "summary": ""
  },
  "experiences": [
    { "company": "", "position": "", "startDate": "", "endDate": "",
      "current": false, "location": "", "description": "" }
  ],
  "education": [
    { "school": "", "degree": "", "field": "", "startDate": "", "endDate": "", "description": "" }
  ],
  "skills": [ { "name": "", "level": 3, "category": "" } ],
  "languages": [ { "name": "", "level": "Courant (C1/C2)" } ],
  "projects": [ { "name": "", "description": "", "url": "", "technologies": "" } ],
  "certifications": [
    { "name": "", "issuer": "", "date": "", "expiryDate": "", "credentialId": "", "url": "" }
  ],
  "interests": [ { "name": "", "category": "Autre", "description": "" } ]
}

RÈGLES STRICTES :
- Toutes les dates au format "YYYY-MM" (ex: "2021-03"). Si seule l'année est connue : "YYYY".
  Si inconnue : "".
- Pour une expérience/formation en cours : "current": true et "endDate": "".
- "skills[].level" est un entier de 1 (débutant) à 5 (expert). Estime-le à partir du contexte,
  sinon mets 3. "category" regroupe la compétence (ex: "Frontend", "Langages", "Outils").
- "languages[].level" doit être EXACTEMENT l'une de ces valeurs :
  "Langue maternelle", "Bilingue", "Courant (C1/C2)", "Intermédiaire (B1/B2)", "Débutant (A1/A2)".
- N'invente RIEN : si une information n'est pas dans le texte, laisse le champ vide ou omets l'item.
  Ne crée pas de compétences ou d'expériences fictives.
- Conserve les chiffres et résultats quantifiables dans les descriptions (très importants).
- Renvoie des tableaux vides [] pour les sections absentes. Aucune valeur null.

TEXTE BRUT DU CV :
"""
${resumeText}
"""`;
}

// Prompt d'analyse d'offre + audit de compatibilité (un seul appel).
export function buildJobAuditPrompt(cvJson, jobText) {
  return `Tu es un expert ATS et recrutement tech. On te donne (1) le texte d'une OFFRE
D'EMPLOI et (2) un CV au format JSON. Analyse l'offre, puis compare-la au CV.
Renvoie UNIQUEMENT un objet JSON valide (aucun texte autour, pas de Markdown) :

{
  "job": {
    "title": "", "company": "", "seniority": "",
    "hardSkills": [], "softSkills": [], "keywords": []
  },
  "audit": {
    "score": 0,
    "breakdown": { "hardSkills": 0, "softSkills": 0, "keywords": 0, "seniority": 0 },
    "matched": [],
    "reformulate": [ { "keyword": "", "found_in": "", "suggestion": "" } ],
    "missing": [ { "keyword": "", "severity": "high", "advice": "" } ],
    "recommendations": []
  }
}

RÈGLES STRICTES :
- "score" et chaque valeur de "breakdown" : entier de 0 à 100.
- "seniority" : niveau d'expérience attendu par l'offre (ex: "Junior", "Confirmé (3-5 ans)", "Senior").
- "matched" : compétences/mots-clés de l'offre DÉJÀ présents dans le CV.
- "reformulate" : présents mais mal exprimés ("found_in" = section du CV, "suggestion" = reformulation).
- "missing" : exigés par l'offre et ABSENTS du CV. "severity" ∈ {"high","medium","low"}.
  "advice" = conseil HONNÊTE — ne JAMAIS inciter à inventer une compétence non possédée.
- "recommendations" : 3 à 6 conseils concrets et priorisés pour améliorer la pertinence.
- Réponds en français. Aucune valeur null ; tableaux vides [] si rien.

OFFRE D'EMPLOI :
"""
${jobText}
"""

CV (JSON) :
"""
${cvJson}
"""`;
}

// Prompt d'optimisation ATS : réécrit résumé + descriptions d'expériences pour
// coller à l'offre, SANS jamais inventer. Reformule l'existant uniquement.
export function buildOptimizePrompt(cvJson, jobText) {
  return `Tu es un expert ATS et rédaction de CV. On te donne le RÉSUMÉ et les
EXPÉRIENCES d'un CV (avec leur index), plus une OFFRE D'EMPLOI. Réécris ces textes
pour MAXIMISER la pertinence vis-à-vis de l'offre.

RÈGLES ABSOLUES (éthique) :
- N'invente JAMAIS d'expérience, de compétence, de technologie ou de chiffre absent du CV.
- Reformule, clarifie et fais remonter l'EXISTANT ; intègre les mots-clés de l'offre
  uniquement s'ils correspondent réellement au vécu décrit.
- Conserve tous les résultats quantifiables déjà présents.
- Ton authentique et professionnel, en français. Phrases orientées résultats/impact.
- Si un texte est déjà optimal, renvoie "after" identique à "before" (il sera ignoré).

Renvoie UNIQUEMENT cet objet JSON (pas de Markdown) :
{
  "summary": { "before": "", "after": "", "rationale": "" },
  "experiences": [ { "index": 0, "before": "", "after": "", "rationale": "" } ],
  "skillsToAdd": [ { "name": "", "category": "", "rationale": "" } ]
}
- "rationale" : 1 phrase expliquant l'amélioration (mots-clés intégrés, etc.).
- "before" : reprends le texte original tel quel.
- "skillsToAdd" : compétences/technos demandées par l'offre, ABSENTES de "currentSkills",
  mais COHÉRENTES avec le profil (déjà visibles dans les expériences, projets ou la formation).
  N'ajoute JAMAIS une compétence sans rapport avec le vécu du candidat. Max 8.
  "category" : réutilise une catégorie existante si possible (ex: "Développement Web",
  "Programmation", "Bases de données", "Outils"). Renvoie [] si rien de pertinent.

OFFRE D'EMPLOI :
"""
${jobText}
"""

CV (résumé + expériences indexées) :
"""
${cvJson}
"""`;
}
