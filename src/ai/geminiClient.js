// Client Gemini minimal via l'API REST (pas de SDK → bundle léger).
// La clé peut venir de .env.local (dev) ou être saisie par l'utilisateur (stockée
// localement). Pour un projet perso sur le free tier, c'est suffisant.
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
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

  const generationConfig = { responseMimeType: 'application/json', temperature };
  // Les modèles 2.5 activent le "thinking" par défaut : inutile pour de
  // l'extraction structurée, et ça consomme des tokens + de la latence.
  if (/2\.5/.test(mdl)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  let res;
  try {
    res = await fetch(`${ENDPOINT}/${mdl}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
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
  const candidate = data?.candidates?.[0];
  // Concatène TOUS les parts texte : un modèle 2.5 peut répartir la réponse
  // sur plusieurs parts (et la 1ʳᵉ n'est pas toujours la bonne).
  const parts = candidate?.content?.parts || [];
  let text = parts.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('').trim();

  if (!text) {
    const reason = candidate?.finishReason;
    const hint = reason === 'MAX_TOKENS'
      ? ' (réponse tronquée : MAX_TOKENS — réessaie, le CV est peut-être trop long)'
      : reason && reason !== 'STOP' ? ` (finishReason: ${reason})` : '';
    throw new Error(`Réponse vide de Gemini${hint}.`);
  }

  // En cas de fence Markdown résiduelle (```json … ```), on nettoie.
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Gemini a renvoyé une réponse non-JSON exploitable.');
  }
}
