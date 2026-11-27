// Relais serveur vers l'API Gemini : la clé reste côté serveur (variable
// d'environnement GEMINI_API_KEY) et n'apparaît jamais dans le JavaScript du site.
// Utilisé par la fonction Vercel (api/gemini.js) et par le serveur de dev/preview Vite.
//
// Protections : POST uniquement, appel depuis le site lui-même (même origine ou
// origine autorisée), taille de requête bornée, champs Gemini filtrés, modèle
// validé, limite de débit par adresse IP (au mieux : mémoire de l'instance).

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_BODY_BYTES = 400 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 40;
const ALLOWED_FIELDS = ['contents', 'systemInstruction', 'generationConfig'];

const hits = new Map();

const error = (status, message) => ({ status, json: { error: { code: status, message } } });

export function getServerKey(env = process.env) {
  // VITE_GEMINI_API_KEY accepté par compatibilité : lu ici côté serveur uniquement.
  return String(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '').trim();
}

function hostOf(value) {
  try { return new URL(value).host.toLowerCase(); } catch { return ''; }
}

// Le site appelle /api/gemini sur son propre domaine : l'origine doit être le même
// hôte que la requête, ou figurer dans ALLOWED_ORIGINS (liste séparée par des virgules).
export function isAllowedOrigin(headers = {}, env = process.env) {
  const origin = hostOf(headers.origin || headers.referer || '');
  if (!origin) return false;
  const requestHost = String(headers['x-forwarded-host'] || headers.host || '').split(',')[0].trim().toLowerCase();
  if (origin === requestHost) return true;
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((o) => hostOf(o.trim()) || o.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(origin);
}

export function rateLimited(ip, now = Date.now()) {
  const key = ip || 'inconnu';
  const recent = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

export function resetRateLimit() { hits.clear(); }

function clientIp(headers = {}) {
  return String(headers['x-forwarded-for'] || headers['x-real-ip'] || '').split(',')[0].trim();
}

/**
 * Traite une requête du site et renvoie { status, json } (réponse de Gemini
 * relayée telle quelle, ou erreur au même format { error: { message } }).
 */
export async function handleGeminiRequest({ method, headers = {}, rawBody = '', env = process.env, fetchImpl = fetch }) {
  if (method !== 'POST') return error(405, 'Méthode non autorisée.');
  if (!isAllowedOrigin(headers, env)) return error(403, 'Origine non autorisée.');
  if (Buffer.byteLength(rawBody || '') > MAX_BODY_BYTES) return error(413, 'Requête trop volumineuse.');
  if (rateLimited(clientIp(headers))) {
    return error(429, 'Trop de demandes à l’assistant IA en peu de temps. Réessaie dans quelques minutes.');
  }

  const key = getServerKey(env);
  if (!key) return error(503, 'Service IA non configuré : la clé GEMINI_API_KEY est absente côté serveur.');

  let body;
  try { body = JSON.parse(rawBody || '{}'); } catch { return error(400, 'Requête JSON invalide.'); }
  const payload = body && typeof body.payload === 'object' && body.payload ? body.payload : null;
  if (!payload || !Array.isArray(payload.contents) || !payload.contents.length) {
    return error(400, 'Requête Gemini invalide : « contents » manquant.');
  }
  const forwarded = Object.fromEntries(ALLOWED_FIELDS.filter((f) => f in payload).map((f) => [f, payload[f]]));

  const model = String(env.GEMINI_MODEL || env.VITE_GEMINI_MODEL || DEFAULT_MODEL).trim();
  if (!/^gemini-[\w.-]+$/.test(model)) return error(500, `Modèle Gemini invalide côté serveur : « ${model} ».`);
  // Les modèles « 2.5 flash » réfléchissent par défaut : inutile pour de l'extraction
  // structurée (latence et jetons en plus), on désactive.
  if (/2\.5-flash/.test(model) && forwarded.generationConfig && !forwarded.generationConfig.thinkingConfig) {
    forwarded.generationConfig = { ...forwarded.generationConfig, thinkingConfig: { thinkingBudget: 0 } };
  }

  try {
    const res = await fetchImpl(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(forwarded),
    });
    let json;
    try { json = await res.json(); } catch { json = { error: { message: `Réponse illisible de Gemini (${res.status}).` } }; }
    return { status: res.status, json };
  } catch (e) {
    return error(502, `Gemini injoignable : ${e.message}`);
  }
}
