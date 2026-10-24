import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  normalizeAssistantResponse, applyActionsToCV, buildAssistantContext, toGeminiContents, askAssistant,
} from '../cvAssistant';
import sampleCV from '@data/sampleCV';
import { migrateCV } from '@data/migrateCV';

const cv = migrateCV({ ...sampleCV, personalInfo: { ...sampleCV.personalInfo, photo: 'data:image/png;base64,AAAA' } });

describe('normalizeAssistantResponse', () => {
  it('garde les actions valides et rejette ids inconnus, champs interdits et non-changements', () => {
    const res = normalizeAssistantResponse({
      reply: 'Voici',
      actions: [
        { type: 'update_personal', fields: { summary: 'Nouveau profil', photo: 'x', hacker: 1 }, reason: 'plus court' },
        { type: 'update_personal', fields: { firstName: 'Amine' } }, // inchangé
        { type: 'update_item', section: 'experiences', id: 'exp-1', fields: { description: ['Fait A', '- Fait B'], startDate: '07/2025', id: 'zzz' } },
        { type: 'update_item', section: 'experiences', id: 'inconnu', fields: { position: 'X' } },
        { type: 'update_item', section: 'meta', id: 'exp-1', fields: { position: 'X' } },
        { type: 'add_item', section: 'skills', item: { name: 'Kubernetes', category: 'DevOps & Outils', level: 9 } },
        { type: 'add_item', section: 'skills', item: { name: 'docker' } }, // doublon (casse ignorée)
        { type: 'add_item', section: 'projects', item: { description: 'sans nom' } },
        { type: 'remove_item', section: 'interests', id: 'int-2' },
        { type: 'reorder_items', section: 'projects', ids: ['proj-3', 'proj-1', 'nope'] },
        { type: 'update_design', fields: { density: 'compact', template: 'inexistant', fontScale: 3, hiddenSections: ['interests', 'xxx'] } },
        { type: 'delete_everything' },
        'pas un objet',
      ],
      suggestions: ['a', 'b', 'c', 'd'],
    }, cv);

    expect(res.reply).toBe('Voici');
    expect(res.suggestions).toEqual(['a', 'b', 'c']);
    const types = res.actions.map((a) => a.type);
    expect(types).toEqual(['update_personal', 'update_item', 'add_item', 'remove_item', 'reorder_items', 'update_design']);

    const [personal, item, add, , reorder, design] = res.actions;
    expect(personal.fields).toEqual({ summary: 'Nouveau profil' });
    expect(item.fields).toEqual({ description: '- Fait A\n- Fait B', startDate: '2025-07' });
    expect(add.item).toMatchObject({ name: 'Kubernetes', level: 5, category: 'DevOps & Outils' });
    expect(reorder.ids).toEqual(['proj-3', 'proj-1', 'proj-2']);
    expect(design.fields).toEqual({ density: 'compact', fontScale: 1.1, hiddenSections: ['interests'] });
    expect(personal.changes[0]).toMatchObject({ label: 'Profil', after: 'Nouveau profil' });
  });

  it('refuse une réponse qui n’est pas un objet', () => {
    expect(() => normalizeAssistantResponse('texte', cv)).toThrow();
  });
});

describe('applyActionsToCV', () => {
  it('applique les actions sans muter le CV source', () => {
    const { actions } = normalizeAssistantResponse({
      actions: [
        { type: 'update_personal', fields: { availability: 'Dès mars 2027' } },
        { type: 'update_item', section: 'experiences', id: 'exp-2', fields: { position: 'Conseiller client' } },
        { type: 'add_item', section: 'certifications', item: { name: 'AWS Cloud Practitioner', issuer: 'AWS' } },
        { type: 'remove_item', section: 'languages', id: 'lang-3' },
        { type: 'reorder_items', section: 'education', ids: ['edu-2'] },
        { type: 'update_design', fields: { sectionTitles: { achievements: 'Algorithmique' } } },
      ],
    }, cv);
    const next = applyActionsToCV(cv, actions);

    expect(next.personalInfo.availability).toBe('Dès mars 2027');
    expect(next.experiences.find((e) => e.id === 'exp-2').position).toBe('Conseiller client');
    expect(next.certifications.at(-1)).toMatchObject({ name: 'AWS Cloud Practitioner', issuer: 'AWS' });
    expect(next.certifications.at(-1).id).toBeTruthy();
    expect(next.languages.map((l) => l.id)).toEqual(['lang-1', 'lang-2']);
    expect(next.education.map((e) => e.id)).toEqual(['edu-2', 'edu-1']);
    expect(next.meta.sectionTitles.achievements).toBe('Algorithmique');
    expect(cv.personalInfo.availability).toBe(sampleCV.personalInfo.availability);
    expect(cv.languages).toHaveLength(3);
  });
});

describe('contexte et historique', () => {
  it("n'envoie pas la photo et conserve les ids", () => {
    const ctx = buildAssistantContext(cv, { pages: 2 });
    expect(JSON.stringify(ctx)).not.toContain('base64');
    expect(ctx.personalInfo.hasPhoto).toBe(true);
    expect(ctx.experiences[0].id).toBe('exp-1');
    expect(ctx.layout.pages).toBe(2);
  });

  it("convertit l'historique en tours Gemini avec le statut des actions", () => {
    const contents = toGeminiContents([
      { role: 'user', text: 'Salut' },
      { role: 'assistant', text: 'Bonjour', actions: [{ type: 'update_personal', title: 'Profil', status: 'appliquée' }] },
      { role: 'error', text: 'boom' },
    ]);
    expect(contents.map((c) => c.role)).toEqual(['user', 'model']);
    expect(contents[1].parts[0].text).toContain('appliquée');
  });
});

describe('askAssistant', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('envoie un dialogue multi-tours avec consignes système et valide la réponse', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify({
          reply: 'Profil raccourci.',
          actions: [{ type: 'update_personal', fields: { summary: 'Élève-ingénieur backend Java.' } }],
          suggestions: ['Et mes projets ?'],
        }) }] } }],
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await askAssistant({
      cv, apiKey: 'test-key', jobText: 'Stage PFE backend Java Spring', pages: 1,
      messages: [{ role: 'user', text: 'Raccourcis mon profil' }],
    });

    expect(res.actions).toHaveLength(1);
    expect(res.suggestions).toEqual(['Et mes projets ?']);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.contents).toEqual([{ role: 'user', parts: [{ text: 'Raccourcis mon profil' }] }]);
    expect(body.systemInstruction.parts[0].text).toContain('Stage PFE backend Java Spring');
    expect(body.systemInstruction.parts[0].text).toContain('"id":"exp-1"');
    expect(body.generationConfig.responseMimeType).toBe('application/json');
  });
});
