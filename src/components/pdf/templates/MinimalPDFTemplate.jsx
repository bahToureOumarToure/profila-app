import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDateRange, resolveSectionOrder, groupSkillsByCategory } from '@utils/cvHelpers';
import { DEFAULT_SECTION_ORDER } from '@data/initialCVData';
import '../pdfFonts';

const styles = StyleSheet.create({
  page:        { fontFamily: 'Inter', fontSize: 9, color: '#333', paddingVertical: 30, paddingHorizontal: 34 },
  name:        { fontSize: 20, fontFamily: 'Inter', fontWeight: 700, color: '#111', letterSpacing: -0.3 },
  title:       { fontSize: 10, fontFamily: 'Inter', fontWeight: 500, marginTop: 3 },
  contactRow:  { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5, marginBottom: 14 },
  contactItem: { fontSize: 7.5, color: '#777', marginRight: 12 },
  secHead:     { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  secDash:     { width: 16, height: 2, marginRight: 6 },
  secTitle:    { fontSize: 8, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 },
  section:     { marginBottom: 13 },
  rowBetween:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  itemTitle:   { fontSize: 9.5, fontFamily: 'Inter', fontWeight: 700, color: '#111' },
  itemSub:     { fontSize: 8, color: '#666', marginBottom: 2 },
  itemDate:    { fontSize: 7, color: '#aaa' },
  itemDesc:    { fontSize: 8, color: '#555', lineHeight: 1.6 },
  block:       { marginBottom: 8 },
  summary:     { fontSize: 8.5, color: '#444', lineHeight: 1.7 },
  langRow:     { flexDirection: 'row', flexWrap: 'wrap' },
  skillsWrap:  { flexDirection: 'row', flexWrap: 'wrap' },
  skillItem:   { fontSize: 8, color: '#444', marginRight: 12, marginBottom: 3 },
  skillLine:   { fontSize: 8, color: '#444', marginBottom: 2 },
  skillCat:    { fontSize: 7, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, opacity: 0.8 },
  langName:    { fontSize: 8, fontFamily: 'Inter', fontWeight: 600, color: '#333' },
  langLevel:   { fontSize: 7, color: '#999' },
});

export function MinimalPDFTemplate({ cvData }) {
  const {
    personalInfo: p, experiences, education, skills, languages, projects,
    certifications = [], interests = [], achievements = [], distinctions = [],
    meta,
  } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';
  const order = resolveSectionOrder(meta, DEFAULT_SECTION_ORDER);

  const Section = ({ title, children }) => (
    <View style={styles.section} wrap={false}>
      <View style={styles.secHead}>
        <View style={[styles.secDash, { backgroundColor: primary }]} />
        <Text style={[styles.secTitle, { color: primary }]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const sections = {
    summary: p.summary && (
      <Section title="À propos"><Text style={styles.summary}>{p.summary}</Text></Section>
    ),
    experiences: experiences.length > 0 && (
      <Section title="Expérience">
        {experiences.map((exp) => (
          <View key={exp.id} style={styles.block}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{exp.position}</Text>
              <Text style={styles.itemDate}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
            </View>
            <Text style={styles.itemSub}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</Text>
            {exp.description && <Text style={styles.itemDesc}>{exp.description}</Text>}
          </View>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Formation">
        {education.map((edu) => (
          <View key={edu.id} style={styles.block}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{edu.degree}</Text>
              <Text style={styles.itemDate}>{formatDateRange(edu.startDate, edu.endDate, false)}</Text>
            </View>
            <Text style={styles.itemSub}>{edu.school}{edu.field ? ` · ${edu.field}` : ''}</Text>
          </View>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Compétences">
        {(() => {
          const groups = groupSkillsByCategory(skills);
          const showCat = groups.length > 1;
          return groups.map((g) => (
            <View key={g.cat} wrap={false} style={{ marginBottom: showCat ? 4 : 0 }}>
              {showCat && <Text style={[styles.skillCat, { color: primary }]}>{g.cat}</Text>}
              <View style={styles.skillsWrap}>
                {g.items.map((name, i) => <Text key={i} style={styles.skillItem}>{name}</Text>)}
              </View>
            </View>
          ));
        })()}
      </Section>
    ),
    languages: languages.length > 0 && (
      <Section title="Langues">
        <View style={styles.langRow}>
          {languages.map((l) => (
            <View key={l.id} style={{ marginRight: 18, marginBottom: 3 }}>
              <Text style={styles.langName}>{l.name}</Text>
              <Text style={styles.langLevel}>{l.level}</Text>
            </View>
          ))}
        </View>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Projets">
        {projects.map((proj) => (
          <View key={proj.id} style={styles.block}>
            <Text style={styles.itemTitle}>{proj.name}</Text>
            {proj.technologies && <Text style={styles.itemSub}>{proj.technologies}</Text>}
            {proj.description && <Text style={styles.itemDesc}>{proj.description}</Text>}
          </View>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map((c) => (
          <View key={c.id} style={styles.block}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{c.name}</Text>
              <Text style={styles.itemDate}>{formatDateRange(c.date, c.expiryDate, false)}</Text>
            </View>
            <Text style={styles.itemSub}>{c.issuer}{c.credentialId ? ` · N° ${c.credentialId}` : ''}</Text>
          </View>
        ))}
      </Section>
    ),
    achievements: achievements.length > 0 && (
      <Section title="Palmarès sportif">
        {achievements.map((a) => (
          <View key={a.id} style={styles.block}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{a.rank ? `${a.rank} — ` : ''}{a.title}</Text>
              <Text style={styles.itemDate}>{formatDateRange(a.date, '', false)}</Text>
            </View>
            {(a.competition || a.location) && (
              <Text style={styles.itemSub}>{[a.competition, a.location].filter(Boolean).join(' · ')}</Text>
            )}
            {a.description && <Text style={styles.itemDesc}>{a.description}</Text>}
          </View>
        ))}
      </Section>
    ),
    distinctions: distinctions.length > 0 && (
      <Section title="Distinctions & publications">
        {distinctions.map((d) => (
          <View key={d.id} style={styles.block}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{d.title}</Text>
              <Text style={styles.itemDate}>{formatDateRange(d.date, '', false)}</Text>
            </View>
            <Text style={styles.itemSub}>{[d.type, d.issuer].filter(Boolean).join(' · ')}</Text>
            {d.description && <Text style={styles.itemDesc}>{d.description}</Text>}
          </View>
        ))}
      </Section>
    ),
    interests: interests.length > 0 && (
      <Section title="Centres d'intérêt">
        <Text style={styles.skillLine}>{interests.map((it) => it.name).filter(Boolean).join('  ·  ')}</Text>
      </Section>
    ),
  };

  const contacts = [p.email, p.phone, p.location].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{p.firstName} {p.lastName}</Text>
        {p.title && <Text style={[styles.title, { color: primary }]}>{p.title}</Text>}
        <View style={styles.contactRow}>
          {contacts.map((c, i) => <Text key={i} style={styles.contactItem}>{c}</Text>)}
        </View>

        {order.map((k) => (sections[k] ? <View key={k}>{sections[k]}</View> : null))}
      </Page>
    </Document>
  );
}
