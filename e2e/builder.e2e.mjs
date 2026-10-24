// Test fonctionnel de bout en bout de l'éditeur (navigateur réel, Gemini simulé).
// Prérequis : l'application servie sur E2E_BASE_URL (par défaut `npm run build && npx vite preview`).
// Usage : npm run test:e2e
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:4173';
const SHOTS = process.env.E2E_SCREENSHOTS || '';
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` }); };
const step = (name) => console.log(`• ${name}`);
const readCV = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('profila_cv_data')));

// Réponse simulée de l'assistant : cible le premier élément réellement présent dans le CV envoyé.
function fakeGemini(body) {
  const sys = body.systemInstruction?.parts?.[0]?.text || '';
  const marker = 'CV ACTUEL (JSON) :';
  const cv = JSON.parse(sys.slice(sys.indexOf(marker) + marker.length));
  return {
    reply: 'Ton profil est solide. Je propose :\n- un profil plus ciblé\n- des puces chiffrées',
    actions: [
      { type: 'update_personal', fields: { summary: 'Élève-ingénieur backend Java/Spring, microservices. Stage PFE dès février 2027.' }, reason: 'Plus direct' },
      { type: 'update_item', section: 'experiences', id: cv.experiences[0].id, fields: { description: '- Modélisé 4 objets Salesforce\n- Automatisé 6 flux métier' }, reason: "Verbes d'action" },
      { type: 'add_item', section: 'skills', item: { name: 'Kubernetes', category: 'DevOps & Outils' }, reason: "Demandé par l'offre" },
    ],
    suggestions: ['Et mes projets ?'],
  };
}

const browser = await chromium.launch();
const errors = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('dialog', (d) => d.accept());

  const calls = [];
  await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
    const body = JSON.parse(route.request().postData());
    calls.push(body);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(fakeGemini(body)) }] } }] }),
    });
  });

  step("ouverture de l'éditeur et aperçu PDF");
  await page.goto(`${BASE}/builder`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-testid="cv-preview"] canvas', { timeout: 30000 });

  step('chargement du CV exemple → 1 page');
  await page.getByLabel("Plus d'actions").click();
  await page.getByText('Charger un CV exemple').click();
  await page.waitForFunction(() => {
    const txt = document.body.innerText;
    return txt.includes('1 page') && document.querySelector('[data-testid="cv-preview"] canvas');
  }, null, { timeout: 30000 });
  assert.equal((await readCV(page)).personalInfo.lastName, 'Bennani');
  await page.waitForTimeout(1500);
  await shot(page, '01-exemple');

  step('changement de template et de densité');
  await page.getByRole('tab', { name: 'Design' }).click();
  await page.getByText('Moderne', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Compact' }).click();
  let cv = await readCV(page);
  assert.equal(cv.meta.template, 'modern');
  assert.equal(cv.meta.fontFamily, 'Inter');
  assert.equal(cv.meta.density, 'compact');
  await page.waitForTimeout(2500);
  await shot(page, '02-moderne-compact');

  step('dialogue avec l’assistant : proposition, sélection, application');
  await page.getByRole('button', { name: 'Assistant IA' }).click();
  await page.getByLabel("Message pour l'assistant").fill('Améliore mon profil pour un stage PFE backend');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Appliquer (3)' }).waitFor({ timeout: 15000 });
  await page.locator('[data-testid="assistant-messages"] input[type="checkbox"]').nth(2).uncheck();
  await page.getByRole('button', { name: 'Appliquer (2)' }).click();
  await shot(page, '03-assistant');
  cv = await readCV(page);
  assert.ok(cv.personalInfo.summary.startsWith('Élève-ingénieur backend Java/Spring'));
  assert.equal(cv.experiences[0].description, '- Modélisé 4 objets Salesforce\n- Automatisé 6 flux métier');
  assert.ok(!cv.skills.some((s) => s.name === 'Kubernetes'), 'compétence décochée non ajoutée');
  assert.ok(calls[0].systemInstruction.parts[0].text.includes('"id":"exp-1"'));
  assert.ok(!calls[0].systemInstruction.parts[0].text.includes('base64'));

  step('second tour : l’historique et le statut des actions sont transmis');
  await page.getByText('Et mes projets ?').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid="assistant-messages"] button').length > 0);
  await page.waitForTimeout(1000);
  assert.deepEqual(calls[1].contents.map((c) => c.role), ['user', 'model', 'user']);
  assert.ok(calls[1].contents[1].parts[0].text.includes('appliquée'));

  step('annulation de la dernière modification');
  await page.getByRole('button', { name: 'Annuler' }).first().click();
  cv = await readCV(page);
  assert.ok(cv.personalInfo.summary.startsWith('Élève-ingénieur en dernière année'));

  step('analyse ATS');
  await page.getByRole('button', { name: 'Analyse ATS' }).click();
  await page.getByText('Analyse ATS', { exact: true }).last().waitFor();
  await shot(page, '04-ats');

  step('téléchargement du PDF');
  await page.getByRole('button', { name: 'Télécharger PDF' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Télécharger', exact: true }).click(),
  ]);
  assert.equal(download.suggestedFilename(), 'cv-amine-bennani.pdf');
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  const pdf = Buffer.concat(chunks).toString('latin1');
  assert.ok(pdf.startsWith('%PDF'));
  assert.equal((pdf.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length, 1, 'le PDF tient sur une page');

  step('mobile : aperçu dans le tiroir');
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('pageerror', (e) => errors.push(`mobile pageerror: ${e.message}`));
  await mobile.goto(`${BASE}/builder`);
  await mobile.getByLabel('Aperçu du CV').click();
  await mobile.waitForSelector('[data-testid="cv-preview"] canvas', { timeout: 30000 });
  await shot(mobile, '05-mobile');

  assert.deepEqual(errors, [], `erreurs navigateur :\n${errors.join('\n')}`);
  console.log('✓ scénario E2E réussi');
} finally {
  await browser.close();
}
