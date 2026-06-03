// Client Gemini minimal via l'API REST (pas de SDK → bundle léger).
// La clé peut venir de .env.local (dev) ou être saisie par l'utilisateur (stockée
// localement). Pour un projet perso sur le free tier, c'est suffisant.
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const KEY_STORAGE = 'profila_gemini_key';

export function getApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof localStorage !== 'undefined' && localStorage.getItem(KEY_STORAGE)) ||
    ''
  );
}

export function setApiKey(key) {
  try { localStorage.setItem(KEY_STORAGE, key.trim()); } catch { /* storage indispo */ }
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

/**
 * Appelle Gemini et renvoie un objet JSON parsé (responseMimeType: application/json).
 * @param {{ prompt: string, apiKey?: string, model?: string, temperature?: number }} opts
 */
export async function generateJSON({ prompt, apiKey, model, temperature = 0.2 }) {
  const key = (apiKey || getApiKey()).trim();
  if (!key) {
    throw new Error('Clé API Gemini manquante. Ajoute VITE_GEMINI_API_KEY ou saisis ta clé.');
  }
  const mdl = model || DEFAULT_MODEL;

  let res;
  try {
    res = await fetch(`${ENDPOINT}/${mdl}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature },
      }),
    });
  } catch (e) {
    throw new Error(`Réseau indisponible lors de l'appel à Gemini : ${e.message}`);
  }

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json())?.error?.message || ''; } catch { /* ignore */ }
    if (res.status === 400 && /API key/i.test(detail)) throw new Error('Clé API Gemini invalide.');
    if (res.status === 429) throw new Error('Quota Gemini atteint (free tier). Réessaie plus tard.');
    throw new Error(`Erreur Gemini (${res.status})${detail ? ` : ${detail}` : ''}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Réponse vide de Gemini.');

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Gemini a renvoyé une réponse non-JSON exploitable.');
  }
}
