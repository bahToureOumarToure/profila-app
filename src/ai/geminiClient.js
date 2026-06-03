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
    let status = '';
    try {
      const body = (await res.json())?.error;
      detail = body?.message || '';
      status = body?.status || '';
    } catch { /* corps non-JSON */ }
    // Toujours remonter le message réel de Google : un 429 peut signifier
    // débit/minute dépassé, quota/jour, modèle indisponible sur la clé, ou
    // free tier non disponible dans la région — ce ne sont pas la même chose.
    if (res.status === 400 && /API key/i.test(detail)) {
      throw new Error('Clé API Gemini invalide. Vérifie VITE_GEMINI_API_KEY / la clé saisie.');
    }
    if (res.status === 404) {
      throw new Error(`Modèle "${mdl}" introuvable pour cette clé. Essaie VITE_GEMINI_MODEL=gemini-1.5-flash.${detail ? ` (${detail})` : ''}`);
    }
    const label = res.status === 429 ? 'Limite Gemini (429)' : `Erreur Gemini (${res.status}${status ? ` ${status}` : ''})`;
    throw new Error(detail ? `${label} : ${detail}` : label);
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
