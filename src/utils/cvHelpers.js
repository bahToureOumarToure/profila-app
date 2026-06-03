export function formatDateRange(startDate, endDate, current) {
  if (!startDate) return '';
  const start = formatMonthYear(startDate);
  const end = current ? "Aujourd'hui" : (endDate ? formatMonthYear(endDate) : '');
  return end ? `${start} – ${end}` : start;
}

function formatMonthYear(dateString) {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  if (!year) return '';
  if (!month) return year;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
}

export function getInitials(firstName, lastName) {
  return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
}

// Ordre effectif des sections : la préférence utilisateur, complétée par les
// sections manquantes dans l'ordre par défaut (rétro-compatible avec d'anciens CV).
export function resolveSectionOrder(meta, defaultOrder) {
  const saved = Array.isArray(meta?.sectionOrder) ? meta.sectionOrder : [];
  const valid = saved.filter((k) => defaultOrder.includes(k));
  const missing = defaultOrder.filter((k) => !valid.includes(k));
  return [...valid, ...missing];
}

// Regroupe les compétences par catégorie (ordre d'apparition préservé).
export function groupSkillsByCategory(skills = []) {
  const groups = [];
  const index = {};
  skills.forEach((s) => {
    const name = (s.name || '').trim();
    if (!name) return;
    const cat = (s.category || '').trim() || 'Autres';
    if (!(cat in index)) { index[cat] = groups.length; groups.push({ cat, items: [] }); }
    groups[index[cat]].items.push(name);
  });
  return groups;
}

export function cvCompletionScore(cvData) {
  let score = 0;
  const {
    personalInfo, experiences, education, skills,
    certifications = [], interests = [], achievements = [], distinctions = [],
  } = cvData;

  const personalFields = ['firstName', 'lastName', 'title', 'email', 'phone', 'summary'];
  const filled = personalFields.filter((f) => personalInfo[f]?.trim()).length;
  score += Math.round((filled / personalFields.length) * 35);

  if (experiences.length > 0)     score += 20;
  if (education.length > 0)       score += 15;
  if (skills.length >= 3)         score += 10;

  const extras = [certifications, achievements, distinctions, interests];
  const filledExtras = extras.filter((arr) => arr.length > 0).length;
  score += Math.min(filledExtras, 4) * 5;

  return Math.min(score, 100);
}

export function downloadJSON(data, filename = 'mon-cv.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try { resolve(JSON.parse(e.target.result)); }
      catch { reject(new Error('Fichier JSON invalide')); }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}
