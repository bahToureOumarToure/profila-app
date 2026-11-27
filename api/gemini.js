// Fonction serveur Vercel : POST /api/gemini → relais vers Gemini avec la clé
// GEMINI_API_KEY (variable d'environnement du projet Vercel, jamais envoyée au navigateur).
import { handleGeminiRequest } from '../server/geminiProxy.js';

async function readRawBody(req) {
  // Vercel analyse déjà le JSON ; on reconstitue le texte pour contrôler sa taille.
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  const { status, json } = await handleGeminiRequest({
    method: req.method,
    headers: req.headers,
    rawBody: req.method === 'POST' ? await readRawBody(req) : '',
  });
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(json);
}
