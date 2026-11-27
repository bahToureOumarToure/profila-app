import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGeminiRequest, isAllowedOrigin, getServerKey, resetRateLimit } from '../geminiProxy.js';

const ENV = { GEMINI_API_KEY: 'test-server-key' };
const HEADERS = { origin: 'https://profila.app', host: 'profila.app', 'x-forwarded-for': '1.2.3.4' };
const BODY = JSON.stringify({
  payload: {
    contents: [{ role: 'user', parts: [{ text: 'Bonjour' }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    tools: [{ googleSearch: {} }], // champ non autorisé : doit être retiré
  },
});

const okFetch = () => vi.fn(async () => ({ status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{}' }] } }] }) }));

describe('relais Gemini côté serveur', () => {
  beforeEach(() => resetRateLimit());

  it('relaie la requête avec la clé serveur dans un en-tête et filtre les champs', async () => {
    const fetchImpl = okFetch();
    const res = await handleGeminiRequest({ method: 'POST', headers: HEADERS, rawBody: BODY, env: ENV, fetchImpl });
    expect(res.status).toBe(200);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    expect(url).not.toContain('key=');
    expect(init.headers['x-goog-api-key']).toBe('test-server-key');
    const sent = JSON.parse(init.body);
    expect(Object.keys(sent).sort()).toEqual(['contents', 'generationConfig']);
    expect(sent.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });
  });

  it('utilise GEMINI_MODEL et refuse un modèle invalide', async () => {
    const fetchImpl = okFetch();
    await handleGeminiRequest({ method: 'POST', headers: HEADERS, rawBody: BODY, env: { ...ENV, GEMINI_MODEL: 'gemini-2.0-flash' }, fetchImpl });
    expect(fetchImpl.mock.calls[0][0]).toContain('/gemini-2.0-flash:generateContent');
    const bad = await handleGeminiRequest({ method: 'POST', headers: HEADERS, rawBody: BODY, env: { ...ENV, GEMINI_MODEL: '../x' }, fetchImpl });
    expect(bad.status).toBe(500);
  });

  it('refuse les méthodes, origines et corps invalides', async () => {
    const fetchImpl = okFetch();
    const call = (over) => handleGeminiRequest({ method: 'POST', headers: HEADERS, rawBody: BODY, env: ENV, fetchImpl, ...over });
    expect((await call({ method: 'GET' })).status).toBe(405);
    expect((await call({ headers: { ...HEADERS, origin: 'https://evil.example' } })).status).toBe(403);
    expect((await call({ headers: { host: 'profila.app' } })).status).toBe(403);
    expect((await call({ rawBody: 'pas du json' })).status).toBe(400);
    expect((await call({ rawBody: JSON.stringify({ payload: { contents: [] } }) })).status).toBe(400);
    expect((await call({ rawBody: 'x'.repeat(500 * 1024) })).status).toBe(413);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('signale une clé absente sans appeler Google', async () => {
    const fetchImpl = okFetch();
    const res = await handleGeminiRequest({ method: 'POST', headers: HEADERS, rawBody: BODY, env: {}, fetchImpl });
    expect(res.status).toBe(503);
    expect(res.json.error.message).toContain('GEMINI_API_KEY');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('limite le débit par adresse IP', async () => {
    const fetchImpl = okFetch();
    const statuses = [];
    for (let i = 0; i < 42; i += 1) {
      statuses.push((await handleGeminiRequest({ method: 'POST', headers: HEADERS, rawBody: BODY, env: ENV, fetchImpl })).status);
    }
    expect(statuses.slice(0, 40).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(40)).toEqual([429, 429]);
    const other = await handleGeminiRequest({ method: 'POST', headers: { ...HEADERS, 'x-forwarded-for': '5.6.7.8' }, rawBody: BODY, env: ENV, fetchImpl });
    expect(other.status).toBe(200);
  });

  it('relaie les erreurs de Google telles quelles', async () => {
    const fetchImpl = vi.fn(async () => ({ status: 403, json: async () => ({ error: { code: 403, message: 'Project suspended' } }) }));
    const res = await handleGeminiRequest({ method: 'POST', headers: HEADERS, rawBody: BODY, env: ENV, fetchImpl });
    expect(res).toEqual({ status: 403, json: { error: { code: 403, message: 'Project suspended' } } });
  });

  it('origines autorisées et lecture de la clé', () => {
    expect(isAllowedOrigin({ origin: 'https://profila-app-git-fix.vercel.app', host: 'profila-app-git-fix.vercel.app' }, {})).toBe(true);
    expect(isAllowedOrigin({ origin: 'https://www.profila.app', host: 'profila-app.vercel.app' }, { ALLOWED_ORIGINS: 'https://www.profila.app, profila.app' })).toBe(true);
    expect(isAllowedOrigin({ referer: 'https://profila.app/builder', host: 'profila.app' }, {})).toBe(true);
    expect(getServerKey({ VITE_GEMINI_API_KEY: ' k ' })).toBe('k');
    expect(getServerKey({ GEMINI_API_KEY: 'a', VITE_GEMINI_API_KEY: 'b' })).toBe('a');
  });
});
