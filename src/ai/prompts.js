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
