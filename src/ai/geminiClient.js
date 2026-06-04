// Client Gemini minimal via l'API REST (pas de SDK → bundle léger).
// La clé provient UNIQUEMENT de l'environnement (VITE_GEMINI_API_KEY), définie
// dans .env — inlinée par Vite au build (dev comme prod). Aucune saisie côté UI.
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

export function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

/**
 * Appelle Gemini et renvoie un objet JSON parsé (responseMimeType: application/json).
 * @param {{ prompt: string, apiKey?: string, model?: string, temperature?: number }} opts
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Délai de réessai conseillé par Google (RetryInfo dans details, ou "retry in Xms").
function parseRetryMs(errorBody, message) {
  const details = errorBody?.details || [];
  for (const d of details) {
    if (typeof d?.['@type'] === 'string' && d['@type'].includes('RetryInfo') && d.retryDelay) {
      const m = String(d.retryDelay).match(/([\d.]+)\s*s/);
      if (m) return Math.ceil(parseFloat(m[1]) * 1000);
    }
  }
  const ms = message.match(/retry in ([\d.]+)\s*ms/i);
  if (ms) return Math.ceil(parseFloat(ms[1]));
  const s = message.match(/retry in ([\d.]+)\s*s/i);
  if (s) return Math.ceil(parseFloat(s[1]) * 1000);
  return null;
}

export async function generateJSON({ prompt, apiKey, model, temperature = 0.2, maxRetries = 4, onRetry } = {}) {
  const key = (apiKey || getApiKey()).trim();
  if (!key) {
    throw new Error('Clé API Gemini manquante. Ajoute VITE_GEMINI_API_KEY ou saisis ta clé.');
  }
  const mdl = model || DEFAULT_MODEL;

  const generationConfig = { responseMimeType: 'application/json', temperature };
  // Les modèles 2.5 activent le "thinking" par défaut : inutile pour de
  // l'extraction structurée, et ça consomme des tokens + de la latence.
  if (/2\.5/.test(mdl)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const url = `${ENDPOINT}/${mdl}:generateContent?key=${encodeURIComponent(key)}`;
  const body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig });

  for (let attempt = 0; ; attempt += 1) {
    let res;
    try {
      res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    } catch (e) {
      // Erreur réseau transitoire : on retente quelques fois.
      if (attempt < maxRetries) { await sleep(700 * (attempt + 1)); continue; }
      throw new Error(`Réseau indisponible lors de l'appel à Gemini : ${e.message}`);
    }

    if (res.ok) {
      const data = await res.json();
      const candidate = data?.candidates?.[0];
      // Concatène TOUS les parts texte (un modèle 2.5 peut répartir la réponse).
      const parts = candidate?.content?.parts || [];
      let text = parts.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('').trim();

      if (!text) {
        const reason = candidate?.finishReason;
        const hint = reason === 'MAX_TOKENS'
          ? ' (réponse tronquée : MAX_TOKENS - réessaie, le CV est peut-être trop long)'
          : reason && reason !== 'STOP' ? ` (finishReason: ${reason})` : '';
        throw new Error(`Réponse vide de Gemini${hint}.`);
      }
      // Retire une éventuelle fence Markdown résiduelle.
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('Gemini a renvoyé une réponse non-JSON exploitable.');
      }
    }

    // ── Gestion des erreurs ────────────────────────────────────────────────
    let errorBody = null;
    try { errorBody = (await res.json())?.error; } catch { /* corps non-JSON */ }
    const detail = errorBody?.message || '';
    const gstatus = errorBody?.status || '';

    if (res.status === 400 && /API key/i.test(detail)) {
      throw new Error('Clé API Gemini invalide. Vérifie VITE_GEMINI_API_KEY / la clé saisie.');
    }
    if (res.status === 404) {
      throw new Error(`Modèle "${mdl}" introuvable pour cette clé. Essaie VITE_GEMINI_MODEL=gemini-1.5-flash.`);
    }
    if (res.status === 429) {
      const retryMs = parseRetryMs(errorBody, detail);
      // Limite par minute : Google indique souvent un délai court → on réessaie.
      if (attempt < maxRetries && retryMs != null && retryMs <= 30000) {
        const wait = Math.max(retryMs, 500) + 250;
        onRetry?.(attempt + 1, wait);
        await sleep(wait);
        continue;
      }
      const perMinute = /per ?minute|free_tier_requests|PerMinute/i.test(detail);
      throw new Error(perMinute
        ? 'Limite gratuite Gemini atteinte (≈ 20 requêtes/minute). Patiente une minute puis réessaie.'
        : "Quota gratuit Gemini épuisé pour aujourd'hui. Réessaie plus tard, ou utilise une autre clé/modèle.");
    }
    if (res.status >= 500 && attempt < maxRetries) {
      await sleep(800 * (attempt + 1));
      continue;
    }

    const label = `Erreur Gemini (${res.status}${gstatus ? ` ${gstatus}` : ''})`;
    throw new Error(detail ? `${label} : ${detail}` : label);
  }
}
