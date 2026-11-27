// Sert POST /api/gemini pendant `npm run dev` et `vite preview`, avec le même code
// que la fonction Vercel. La clé est lue dans .env.local (GEMINI_API_KEY), côté Node.
import { loadEnv } from 'vite';
import { handleGeminiRequest } from './geminiProxy.js';

export function geminiApiPlugin() {
  let env = process.env;

  const middleware = async (req, res, next) => {
    if (!req.url || req.url.split('?')[0] !== '/api/gemini') return next();
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const { status, json } = await handleGeminiRequest({
      method: req.method,
      headers: req.headers,
      rawBody: Buffer.concat(chunks).toString('utf8'),
      env,
    });
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(json));
  };

  return {
    name: 'profila:gemini-api',
    configResolved(config) {
      // Préfixe '' : variables sans « VITE_ », jamais injectées dans le bundle client.
      env = { ...loadEnv(config.mode, config.envDir || process.cwd(), ''), ...process.env };
    },
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}
