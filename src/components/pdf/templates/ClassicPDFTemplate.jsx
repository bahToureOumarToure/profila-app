import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDateRange, resolveSectionOrder, groupSkillsByCategory } from '@utils/cvHelpers';
import { DEFAULT_SECTION_ORDER } from '@data/initialCVData';
import { ICONS } from '../PDFIcons';
import '../pdfFonts';

const styles = StyleSheet.create({
  page:        { fontFamily: 'Inter', fontSize: 9, color: '#333', paddingVertical: 22, paddingHorizontal: 28 },
  header:      { alignItems: 'center', marginBottom: 9, paddingBottom: 7 },
  name:        { fontSize: 19, fontFamily: 'Inter', fontWeight: 700, letterSpacing: 0.2 },
  title:       { fontSize: 9.5, color: '#555', marginTop: 3 },
  contactRow:  { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 5 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 4, marginVertical: 1 },
  contactIcon: { marginRight: 3 },
  contactTxt:  { fontSize: 7.5, color: '#666' },
  secTitle:    { fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  secRule:     { borderBottomWidth: 1.5, marginTop: 2, marginBottom: 5 },
  rowBetween:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  itemTitle:   { fontSize: 9.5, fontFamily: 'Inter', fontWeight: 700, color: '#111' },
  itemSub:     { fontSize: 8.5, fontFamily: 'Inter', fontWeight: 600 },
  itemField:   { fontSize: 8, color: '#666' },
  itemDate:    { fontSize: 7.5, color: '#777' },
  itemDesc:    { fontSize: 8, color: '#555', marginTop: 1.5, lineHeight: 1.5 },
  block:       { marginBottom: 6 },
  summary:     { fontSize: 8.5, color: '#444', lineHeight: 1.55 },
  langRow:     { flexDirection: 'row', flexWrap: 'wrap' },
  chipsWrap:   { flexDirection: 'row', flexWrap: 'wrap' },
  chip:        { borderWidth: 1, borderRadius: 3, paddingVertical: 1.5, paddingHorizontal: 5, marginRight: 3, marginBottom: 3 },
  chipTx:      { fontSize: 8 },
  skillCat:    { fontSize: 7, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2, opacity: 0.8 },
  langName:    { fontSize: 8.5, fontFamily: 'Inter', fontWeight: 600, color: '#111' },
  langLevel:   { fontSize: 7.5, color: '#777' },
});

export function ClassicPDFTemplate({ cvData }) {
  const {
    personalInfo: p, experiences, education, skills, languages, projects,
    certifications = [], interests = [], achievements = [], distinctions = [],
    meta,
  } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';
  const order = resolveSectionOrder(meta, DEFAULT_SECTION_ORDER);

  const Section = ({ title, children }) => (
    <View wrap={false}>
      <Text style={[styles.secTitle, { color: primary }]}>{title}</Text>
      <View style={[styles.secRule, { borderBottomColor: primary }]} />
      {children}
    </View>
  );

  const Chips = ({ items }) => (
    <View style={styles.chipsWrap}>
      {items.map((label, i) => (
        <View key={i} style={[styles.chip, { borderColor: primary }]}>
          <Text style={[styles.chipTx, { color: primary }]}>{label}</Text>
        </View>
      ))}
    </View>
  );

  const sections = {
    summary: p.summary && (
      <Section title="Résumé"><Text style={styles.summary}>{p.summary}</Text></Section>
    ),
    experiences: experiences.length > 0 && (
      <Section title="Expérience professionnelle">
        {experiences.map((exp) => (
          <View key={exp.id} style={styles.block}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{exp.position}</Text>
              <Text style={styles.itemDate}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
            </View>
            <Text style={[styles.itemSub, { color: primary }]}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</Text>
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
            <Text style={[styles.itemSub, { color: primary }]}>{edu.school}</Text>
            {edu.field && <Text style={styles.itemField}>{edu.field}</Text>}
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
              <Chips items={g.items} />
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
            {proj.technologies && <Text style={[styles.itemSub, { color: primary }]}>{proj.technologies}</Text>}
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
            {c.issuer && <Text style={[styles.itemSub, { color: primary }]}>{c.issuer}{c.credentialId ? ` · N° ${c.credentialId}` : ''}</Text>}
          </View>
        ))}
      </Section>
    ),
    achievements: achievements.length > 0 && (
      <Section title="Palmarès sportif">
        {achievements.map((a) => (
          <View key={a.id} style={styles.block}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemTitle}>{a.rank ? `${a.rank} - ` : ''}{a.title}</Text>
              <Text style={styles.itemDate}>{formatDateRange(a.date, '', false)}</Text>
            </View>
            {(a.competition || a.location) && (
              <Text style={[styles.itemSub, { color: primary }]}>{[a.competition, a.location].filter(Boolean).join(' · ')}</Text>
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
            <Text style={[styles.itemSub, { color: primary }]}>{[d.type, d.issuer].filter(Boolean).join(' · ')}</Text>
            {d.description && <Text style={styles.itemDesc}>{d.description}</Text>}
          </View>
        ))}
      </Section>
    ),
    interests: interests.length > 0 && (
      <Section title="Centres d'intérêt"><Chips items={interests.map((it) => it.name).filter(Boolean)} /></Section>
    ),
  };

  const contacts = [
    { key: 'email',    value: p.email },
    { key: 'phone',    value: p.phone },
    { key: 'location', value: p.location },
    { key: 'website',  value: p.website },
    { key: 'linkedin', value: p.linkedin },
    { key: 'github',   value: p.github },
  ].filter((c) => c.value);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderBottomWidth: 3, borderBottomColor: primary }]}>
          <Text style={[styles.name, { color: primary }]}>{p.firstName} {p.lastName}</Text>
          {p.title && <Text style={styles.title}>{p.title}</Text>}
          <View style={styles.contactRow}>
            {contacts.map((c) => {
              const Icon = ICONS[c.key];
              return (
                <View key={c.key} style={styles.contactItem}>
                  <View style={styles.contactIcon}><Icon size={8} color={primary} /></View>
                  <Text style={styles.contactTxt}>{c.value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {order.map((k) => (sections[k] ? <View key={k}>{sections[k]}</View> : null))}
      </Page>
    </Document>
  );
}
