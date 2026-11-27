// Client Gemini du navigateur. Il n'appelle jamais Google directement : il passe
// par la fonction serveur /api/gemini (api/gemini.js), qui détient la clé
// GEMINI_API_KEY côté serveur. Aucune clé n'est présente dans le JavaScript du site.
const ENDPOINT = '/api/gemini';

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

/**
 * Appelle Gemini et renvoie un objet JSON parsé (responseMimeType: application/json).
 * Mode simple : `prompt`. Mode conversation : `contents` (tours user/model) +
 * `systemInstruction` (consignes et contexte rafraîchis à chaque appel).
 */
export async function generateJSON({
  prompt, contents, systemInstruction, temperature = 0.2, maxRetries = 4, onRetry,
} = {}) {
  const generationConfig = { responseMimeType: 'application/json', temperature };
  const payload = {
    contents: contents?.length ? contents : [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
  };
  if (systemInstruction) payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  const body = JSON.stringify({ payload });

  for (let attempt = 0; ; attempt += 1) {
    let res;
    try {
      res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    } catch (e) {
      // Erreur réseau transitoire : on retente quelques fois.
      if (attempt < maxRetries) { await sleep(700 * (attempt + 1)); continue; }
      throw new Error(`Réseau indisponible lors de l'appel à l'assistant IA : ${e.message}`);
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

    if ((res.status === 400 && /API key/i.test(detail)) || (res.status === 403 && /API key|permission|suspend/i.test(detail))) {
      throw new Error("Clé API Gemini refusée par Google (invalide, restreinte ou projet suspendu). L'administrateur du site doit vérifier GEMINI_API_KEY dans Vercel.");
    }
    if (res.status === 503 && /GEMINI_API_KEY/.test(detail)) {
      throw new Error("L'assistant IA n'est pas encore configuré sur ce site (clé GEMINI_API_KEY absente côté serveur).");
    }
    if (res.status === 404 && /model/i.test(detail)) {
      throw new Error(`Modèle Gemini introuvable pour cette clé. L'administrateur peut définir GEMINI_MODEL (ex. gemini-2.5-flash) dans Vercel.`);
    }
    if (res.status === 404) {
      throw new Error("Service IA introuvable (/api/gemini). Sur un hébergement statique, les fonctions IA nécessitent la fonction serveur Vercel.");
    }
    if (res.status === 429 && /Trop de demandes/.test(detail)) {
      throw new Error(detail);
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
