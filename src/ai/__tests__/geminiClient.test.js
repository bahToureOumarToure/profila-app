import { describe, it, expect } from 'vitest';
import { explainKeyError } from '../geminiClient';

describe('explication des refus de clé Google', () => {
  it('identifie la cause et la recopie', () => {
    expect(explainKeyError('Requests from referer <empty> are blocked.')).toContain('Référents HTTP');
    expect(explainKeyError('Permission denied: Consumer has been suspended.')).toContain('suspendu');
    expect(explainKeyError('API key not valid. Please pass a valid API key.')).toContain('recopie-la');
    expect(explainKeyError('Generative Language API has not been used in project 123 before or it is disabled.')).toContain("n'est pas activée");
    expect(explainKeyError('x', { details: [{ reason: 'API_KEY_SERVICE_BLOCKED' }] })).toContain('Generative Language');
    expect(explainKeyError('API key not valid.')).toContain('(Google : « API key not valid. »)');
  });
});
