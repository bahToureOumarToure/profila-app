// Moteur de rendu PDF unique pour tous les templates.
// Règles ATS : une seule colonne, ordre de lecture = ordre visuel, aucun texte
// dans des images, titres de section standards, liens lisibles ET cliquables,
// métadonnées PDF renseignées (titre, auteur, mots-clés).
import { Document, Page, Text, View, Link, Image } from '@react-pdf/renderer';
import './pdfFonts';
import { ICONS } from './PDFIcons';
import { buildTheme, FIT_STEPS } from './resumeTheme';
import { DEFAULT_SECTION_ORDER } from '@data/initialCVData';
import {
  formatDateRange, formatMonthYear, resolveSectionOrder, isSectionHidden, sectionTitle,
  groupSkillsByCategory, parseDescription, parseInlineBold, normalizeUrl, prettyUrl,
  telHref, formatLanguageLevel, stripInlineMarkup,
} from '@utils/cvHelpers';

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

function makeStyles(t) {
  const { preset, sp } = t;
  const heading = preset.heading;
  return {
    page: {
      fontFamily: t.family,
      fontSize: t.base,
      color: t.text,
      lineHeight: t.lineHeight,
      paddingTop: 22 + 6 * sp,
      paddingBottom: 20 + 6 * sp,
      paddingHorizontal: 38,
    },
    name: {
      fontSize: preset.nameSize * Math.min(1, t.scale + 0.04),
      fontWeight: preset.nameWeight ?? 700,
      color: preset.nameColor === 'primary' ? t.primary : t.text,
      lineHeight: 1.1,
    },
    headline: {
      fontSize: t.base * 1.06,
      color: preset.headlineUpper ? t.primary : t.text,
      textTransform: preset.headlineUpper ? 'uppercase' : 'none',
      marginTop: 2 + sp,
    },
    contactLine: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 + sp },
    contactItem: { flexDirection: 'row', alignItems: 'center', marginRight: 11, marginTop: 1 },
    contactIcon: { marginRight: 3.5 },
    contactText: { fontSize: t.small, color: t.text },
    link: { color: t.text, textDecoration: 'none' },
    linkPrimary: { color: t.primary, textDecoration: 'none' },
    photo: {
      width: preset.photo?.size || 0,
      height: preset.photo?.size || 0,
      borderRadius: preset.photo?.radius || 0,
      objectFit: 'cover',
    },
    section: { marginTop: 5 + 4.5 * sp },
    headingBox: {
      borderBottomWidth: heading.rule,
      borderBottomColor: t.primary,
      paddingBottom: 1.2,
      marginBottom: 2.5 + 2 * sp,
    },
    heading: {
      fontSize: t.base * heading.size,
      fontWeight: heading.weight,
      color: t.primary,
      textTransform: heading.upper ? 'uppercase' : 'none',
      letterSpacing: heading.spacing,
      lineHeight: 1.15,
    },
    entry: { marginBottom: 2 + 3 * sp },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    rowLeft: { flex: 1, paddingRight: 8 },
    rowRight: { textAlign: 'right', fontSize: t.small, color: t.text },
    strong: { fontWeight: 700 },
    italic: { fontStyle: 'italic' },
    primary: { color: t.primary },
    muted: { color: t.muted },
    small: { fontSize: t.small },
    para: { marginTop: 1 + 0.5 * sp },
    summary: { textAlign: preset.summaryAlign },
    bulletRow: { flexDirection: 'row', marginTop: 0.6 + 0.8 * sp, paddingLeft: 7 },
    bulletDot: { width: 9 },
    bulletText: { flex: 1 },
    techLine: { marginTop: 0.6 + 0.8 * sp, fontSize: t.small },
    inlineLine: { marginBottom: 0.6 + 0.8 * sp },
  };
}

// Texte avec segments **gras**.
function Rich({ text, style }) {
  const parts = parseInlineBold(text);
  return (
    <Text style={style}>
      {parts.map((p, i) => (p.bold ? <Text key={i} style={{ fontWeight: 700 }}>{p.text}</Text> : p.text))}
    </Text>
  );
}

function Bullet({ s, children }) {
  return (
    <View style={s.bulletRow} wrap={false}>
      <Text style={s.bulletDot}>•</Text>
      <View style={s.bulletText}>{children}</View>
    </View>
  );
}

function Description({ text, s }) {
  const { paragraph, bullets } = parseDescription(text);
  return (
    <>
      {paragraph ? <Rich text={paragraph} style={s.para} /> : null}
      {bullets.map((b, i) => (
        <Bullet key={i} s={s}><Rich text={b} /></Bullet>
      ))}
    </>
  );
}

function Section({ title, s, children }) {
  return (
    <View style={s.section}>
      <View style={s.headingBox} minPresenceAhead={36}>
        <Text style={s.heading}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({ left, right, leftStyle, rightStyle, s }) {
  if (!left && !right) return null;
  return (
    <View style={s.row}>
      <View style={s.rowLeft}>
        {typeof left === 'string' ? <Text style={leftStyle}>{left}</Text> : left}
      </View>
      {right ? <Text style={[s.rowRight, rightStyle]}>{right}</Text> : null}
    </View>
  );
}

// En-tête d'une entrée (expérience / formation) selon le template.
function EntryHeader({ e, t, s }) {
  const rows = {
    'org-first': [
      { left: e.org, ls: [s.strong, s.primary], right: e.location },
      { left: e.role, ls: [s.italic, s.small], right: e.dates, rs: s.italic },
    ],
    'org-date': [
      { left: e.org, ls: s.strong, right: e.dates, rs: s.strong },
      { left: e.role, ls: [s.italic, s.small], right: e.location, rs: s.italic },
    ],
    'org-location-date': [
      { left: [e.org, e.location].filter(Boolean).join(' – '), ls: s.strong, right: e.dates, rs: s.strong },
      { left: e.role, ls: [s.strong, s.primary, s.small] },
    ],
    'role-first': [
      { left: e.role, ls: s.strong, right: e.dates },
      { left: e.org, ls: [s.italic, s.small], right: e.location, rs: s.italic },
    ],
  }[t.preset.entry];

  return (
    <>
      {rows.map((r, i) => (
        <Row key={i} s={s} left={r.left} right={r.right} leftStyle={r.ls} rightStyle={r.rs} />
      ))}
    </>
  );
}

function TechLine({ value, t, s }) {
  const tech = clean(value);
  if (!tech) return null;
  if (t.preset.tech === 'bullet') {
    return (
      <Bullet s={s}>
        <Text><Text style={s.strong}>{t.preset.techLabel} : </Text>{tech}</Text>
      </Bullet>
    );
  }
  return (
    <Text style={s.techLine}>
      <Text style={s.italic}>{t.preset.techLabel} : </Text>
      <Text style={[s.italic, s.strong]}>{tech}</Text>
    </Text>
  );
}

// ─── En-tête du CV ────────────────────────────────────────────────────────────
function contactItems(p) {
  const items = [];
  if (clean(p.location)) items.push({ key: 'location', text: clean(p.location) });
  if (clean(p.phone)) items.push({ key: 'phone', text: clean(p.phone), href: telHref(p.phone), label: 'Téléphone' });
  if (clean(p.email)) items.push({ key: 'email', text: clean(p.email), href: `mailto:${clean(p.email)}`, label: 'Email' });
  const links = [];
  if (clean(p.linkedin)) links.push({ key: 'linkedin', text: prettyUrl(p.linkedin), href: normalizeUrl(p.linkedin), label: 'LinkedIn' });
  if (clean(p.github)) links.push({ key: 'github', text: prettyUrl(p.github), href: normalizeUrl(p.github), label: 'GitHub' });
  if (clean(p.website)) links.push({ key: 'website', text: prettyUrl(p.website), href: normalizeUrl(p.website), label: 'Portfolio' });
  return { items, links };
}

function ItemText({ item, s }) {
  return item.href
    ? <Link src={item.href} style={s.link}>{item.text}</Link>
    : <Text>{item.text}</Text>;
}

function IconLine({ list, t, s, center }) {
  if (!list.length) return null;
  return (
    <View style={[s.contactLine, center ? { justifyContent: 'center' } : null]}>
      {list.map((item) => {
        const Icon = ICONS[item.key];
        return (
          <View key={item.key} style={s.contactItem}>
            {t.showIcons && Icon ? <View style={s.contactIcon}><Icon size={t.small * 0.95} color={t.text} /></View> : null}
            <Text style={s.contactText}><ItemText item={item} s={s} /></Text>
          </View>
        );
      })}
    </View>
  );
}

// Coordonnées sans icônes : chaque élément est insécable (le retour à la ligne
// se fait entre deux éléments, jamais au milieu d'une URL ou d'un libellé).
function JoinedLine({ list, s, sep, labels, center }) {
  if (!list.length) return null;
  return (
    <View style={[s.contactLine, center ? { justifyContent: 'center' } : null]}>
      {list.map((item, i) => (
        <Text key={item.key} style={[s.contactText, { marginRight: sep ? 0 : 13 }]} wrap={false}>
          {labels && item.label ? <Text style={s.strong}>{item.label} : </Text> : null}
          <ItemText item={item} s={s} />
          {sep && i < list.length - 1 ? sep : ''}
        </Text>
      ))}
    </View>
  );
}

function Header({ cv, t, s }) {
  const p = cv.personalInfo || {};
  const name = [clean(p.firstName), clean(p.lastName)].filter(Boolean).join(' ');
  const headline = [clean(p.title), clean(p.availability)].filter(Boolean).join(t.preset.headlineSep);
  const { items, links } = contactItems(p);
  const photo = t.showPhoto && /^data:image\/(png|jpe?g);/i.test(p.photo || '') ? p.photo : '';
  const kind = t.preset.header;

  if (kind === 'center') {
    return (
      <View style={{ alignItems: 'center' }}>
        {name ? <Text style={[s.name, { textAlign: 'center' }]}>{name}</Text> : null}
        {headline ? <Text style={[s.headline, { textAlign: 'center' }]}>{headline}</Text> : null}
        <JoinedLine list={items} s={s} sep="   |   " center />
        <JoinedLine list={links} s={s} sep="   |   " center />
      </View>
    );
  }

  const center = kind === 'photo-left';
  const body = (
    <View style={{ flex: 1, alignItems: center ? 'center' : 'flex-start' }}>
      {name ? <Text style={[s.name, center ? { textAlign: 'center' } : null]}>{name}</Text> : null}
      {headline ? <Text style={[s.headline, center ? { textAlign: 'center' } : null]}>{headline}</Text> : null}
      {kind === 'photo-left-labeled' ? (
        <>
          <JoinedLine list={items} s={s} labels />
          <JoinedLine list={links} s={s} labels />
        </>
      ) : (
        <>
          <IconLine list={items} t={t} s={s} center={center} />
          <IconLine list={links} t={t} s={s} center={center} />
        </>
      )}
    </View>
  );
  const photoEl = photo ? <Image src={photo} style={s.photo} /> : null;

  return (
    <View style={[s.row, { alignItems: 'center' }]}>
      {kind !== 'left' && photoEl ? <View style={{ marginRight: 14 }}>{photoEl}</View> : null}
      {body}
      {kind === 'left' && photoEl ? <View style={{ marginLeft: 14 }}>{photoEl}</View> : null}
    </View>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────
function inlineDate(value, style) {
  const d = formatMonthYear(value, style);
  return style === 'numeric' ? d : d.toLowerCase();
}

function buildSections(cv, t, s) {
  const p = cv.personalInfo || {};
  const meta = cv.meta || {};
  const ds = t.dateStyle;
  const title = (key) => sectionTitle(meta, key);
  const nonEmpty = (arr, pred) => (arr || []).filter(pred);

  return {
    summary: () => (clean(p.summary) ? (
      <Section title={title('summary')} s={s}>
        <Rich text={clean(p.summary)} style={s.summary} />
      </Section>
    ) : null),

    education: () => {
      const list = nonEmpty(cv.education, (e) => clean(e.school) || clean(e.degree));
      if (!list.length) return null;
      return (
        <Section title={title('education')} s={s}>
          {list.map((e) => {
            const degree = clean(e.degree);
            const field = clean(e.field);
            const role = field && !degree.toLowerCase().includes(field.toLowerCase())
              ? [degree, field].filter(Boolean).join(' – ')
              : degree;
            return (
              <View key={e.id} style={s.entry} wrap={false}>
                <EntryHeader t={t} s={s} e={{
                  org: clean(e.school), role, location: clean(e.location),
                  dates: formatDateRange(e.startDate, e.endDate, false, ds),
                }} />
                <Description text={e.description} s={s} />
              </View>
            );
          })}
        </Section>
      );
    },

    experiences: () => {
      const list = nonEmpty(cv.experiences, (e) => clean(e.company) || clean(e.position));
      if (!list.length) return null;
      return (
        <Section title={title('experiences')} s={s}>
          {list.map((e) => (
            <View key={e.id} style={s.entry} wrap={false}>
              <EntryHeader t={t} s={s} e={{
                org: clean(e.company), role: clean(e.position), location: clean(e.location),
                dates: formatDateRange(e.startDate, e.endDate, e.current, ds),
              }} />
              <Description text={e.description} s={s} />
              <TechLine value={e.technologies} t={t} s={s} />
            </View>
          ))}
        </Section>
      );
    },

    projects: () => {
      const list = nonEmpty(cv.projects, (pr) => clean(pr.name));
      if (!list.length) return null;
      const inlineTech = t.preset.tech === 'bullet' || t.preset.entry === 'role-first';
      return (
        <Section title={title('projects')} s={s}>
          {list.map((pr) => {
            const tech = clean(pr.technologies);
            const nameEl = clean(pr.url)
              ? <Link src={normalizeUrl(pr.url)} style={s.link}>{clean(pr.name)}</Link>
              : clean(pr.name);
            const left = (
              <Text>
                <Text style={s.strong}>{nameEl}</Text>
                {inlineTech && tech ? <Text style={s.small}>{`  |  ${tech}`}</Text> : null}
              </Text>
            );
            return (
              <View key={pr.id} style={s.entry} wrap={false}>
                <Row s={s} left={left} right={formatDateRange(pr.startDate, pr.endDate, false, ds)} rightStyle={s.italic} />
                <Description text={pr.description} s={s} />
                {!inlineTech ? <TechLine value={tech} t={t} s={s} /> : null}
              </View>
            );
          })}
        </Section>
      );
    },

    achievements: () => {
      const list = nonEmpty(cv.achievements, (a) => clean(a.title) || clean(a.rank) || clean(a.competition));
      if (!list.length) return null;
      return (
        <Section title={title('achievements')} s={s}>
          {list.map((a) => {
            const lead = clean(a.rank) || clean(a.title) || clean(a.competition);
            const rest = [
              clean(a.rank) ? clean(a.title) : '',
              lead === clean(a.competition) ? '' : clean(a.competition),
              clean(a.location),
              inlineDate(a.date, ds),
            ].filter(Boolean).join(', ');
            const desc = stripInlineMarkup(clean(a.description));
            return (
              <Bullet key={a.id} s={s}>
                <Text>
                  <Text style={s.strong}>{lead}</Text>
                  {rest ? ` – ${rest}.` : ''}
                  {desc ? ` ${desc}` : ''}
                </Text>
              </Bullet>
            );
          })}
        </Section>
      );
    },

    skills: () => {
      const groups = groupSkillsByCategory(cv.skills || []);
      if (!groups.length) return null;
      const labelled = !(groups.length === 1 && groups[0].cat === 'Autres');
      return (
        <Section title={title('skills')} s={s}>
          {groups.map((g) => (
            <Text key={g.cat} style={s.inlineLine}>
              {labelled ? <Text style={s.strong}>{g.cat} : </Text> : null}
              {g.items.join(', ')}
            </Text>
          ))}
        </Section>
      );
    },

    certifications: () => {
      const list = nonEmpty(cv.certifications, (c) => clean(c.name));
      if (!list.length) return null;
      return (
        <Section title={title('certifications')} s={s}>
          {list.map((c) => {
            const rest = [clean(c.issuer), inlineDate(c.date, ds)].filter(Boolean).join(', ');
            const nameEl = clean(c.url)
              ? <Link src={normalizeUrl(c.url)} style={s.link}>{clean(c.name)}</Link>
              : clean(c.name);
            return (
              <Bullet key={c.id} s={s}>
                <Text>
                  <Text style={s.strong}>{nameEl}</Text>
                  {rest ? ` – ${rest}` : ''}
                  {clean(c.credentialId) ? ` (ID : ${clean(c.credentialId)})` : ''}
                </Text>
              </Bullet>
            );
          })}
        </Section>
      );
    },

    distinctions: () => {
      const list = nonEmpty(cv.distinctions, (d) => clean(d.title));
      if (!list.length) return null;
      return (
        <Section title={title('distinctions')} s={s}>
          {list.map((d) => {
            const rest = [clean(d.type), clean(d.issuer), inlineDate(d.date, ds)].filter(Boolean).join(', ');
            const desc = stripInlineMarkup(clean(d.description));
            const titleEl = clean(d.url)
              ? <Link src={normalizeUrl(d.url)} style={s.link}>{clean(d.title)}</Link>
              : clean(d.title);
            return (
              <Bullet key={d.id} s={s}>
                <Text>
                  <Text style={s.strong}>{titleEl}</Text>
                  {rest ? ` – ${rest}.` : ''}
                  {desc ? ` ${desc}` : ''}
                </Text>
              </Bullet>
            );
          })}
        </Section>
      );
    },

    languages: () => {
      const list = nonEmpty(cv.languages, (l) => clean(l.name));
      if (!list.length) return null;
      const text = list
        .map((l) => (clean(l.level) ? `${clean(l.name)} (${formatLanguageLevel(l.level)})` : clean(l.name)))
        .join(', ');
      return (
        <Section title={title('languages')} s={s}>
          <Text>{text}.</Text>
        </Section>
      );
    },

    interests: () => {
      const list = nonEmpty(cv.interests, (i) => clean(i.name));
      if (!list.length) return null;
      const groups = [];
      list.forEach((i) => {
        const cat = clean(i.category) && i.category !== 'Autre' ? clean(i.category) : '';
        let g = groups.find((x) => x.cat === cat);
        if (!g) { g = { cat, items: [] }; groups.push(g); }
        g.items.push(clean(i.description) ? `${clean(i.name)} (${clean(i.description)})` : clean(i.name));
      });
      const labelled = groups.some((g) => g.cat);
      return (
        <Section title={title('interests')} s={s}>
          {groups.map((g, idx) => (
            <Text key={g.cat || idx} style={s.inlineLine}>
              {labelled ? <Text style={s.strong}>{g.cat || 'Autres'} : </Text> : null}
              {g.items.join(', ')}.
            </Text>
          ))}
        </Section>
      );
    },
  };
}

export function ResumeDocument({ cvData, fit = FIT_STEPS[0] }) {
  const meta = cvData.meta || {};
  const p = cvData.personalInfo || {};
  const t = buildTheme(meta, fit);
  const s = makeStyles(t);
  const sections = buildSections(cvData, t, s);
  const order = resolveSectionOrder(meta, DEFAULT_SECTION_ORDER).filter((k) => !isSectionHidden(meta, k));
  const fullName = [clean(p.firstName), clean(p.lastName)].filter(Boolean).join(' ');
  const keywords = (cvData.skills || []).map((sk) => clean(sk.name)).filter(Boolean).join(', ');

  return (
    <Document
      title={fullName ? `CV ${fullName}${clean(p.title) ? ` – ${clean(p.title)}` : ''}` : 'CV'}
      author={fullName || 'Profila'}
      subject={clean(p.title) || 'Curriculum vitae'}
      keywords={keywords}
      creator="Profila"
      producer="Profila"
      language="fr-FR"
    >
      <Page size="A4" style={s.page}>
        <Header cv={cvData} t={t} s={s} />
        {order.map((k) => {
          const el = sections[k]?.();
          return el ? <View key={k}>{el}</View> : null;
        })}
      </Page>
    </Document>
  );
}

export default ResumeDocument;
