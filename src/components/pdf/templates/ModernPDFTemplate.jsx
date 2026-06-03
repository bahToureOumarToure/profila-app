import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import interRegular from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import interMedium from '@fontsource/inter/files/inter-latin-500-normal.woff?url';
import interSemiBold from '@fontsource/inter/files/inter-latin-600-normal.woff?url';
import interBold from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import { formatDateRange } from '@utils/cvHelpers';

// Police haute qualité (Inter) embarquée pour un PDF net et cohérent avec l'aperçu.
Font.register({
  family: 'Inter',
  fonts: [
    { src: interRegular, fontWeight: 'normal' },
    { src: interMedium, fontWeight: 500 },
    { src: interSemiBold, fontWeight: 600 },
    { src: interBold, fontWeight: 'bold' },
  ],
});
// Évite les césures hasardeuses des mots.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page:       { flexDirection: 'row', fontFamily: 'Inter', fontSize: 9, color: '#1f2430' },
  sidebar:    { width: '34%', minHeight: '100%', padding: 22, color: '#fff' },
  main:       { flex: 1, padding: 26 },
  name:       { fontSize: 15, fontFamily: 'Inter', fontWeight: 700, marginBottom: 2, color: '#fff', letterSpacing: 0.3 },
  title:      { fontSize: 8.5, marginBottom: 14, opacity: 0.85, color: '#fff' },
  avatar:     { width: 74, height: 74, borderRadius: 37, marginBottom: 12, alignSelf: 'center', objectFit: 'cover' },
  sectionLbl: { fontSize: 7.5, fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, opacity: 0.95 },
  divider:    { height: 0.5, backgroundColor: '#fff', opacity: 0.3, marginBottom: 7 },
  contactTxt: { fontSize: 7.5, color: '#fff', opacity: 0.9, marginBottom: 3, lineHeight: 1.4 },
  skillCat:   { fontSize: 7, fontFamily: 'Inter', fontWeight: 600, color: '#fff', opacity: 0.7, marginTop: 5, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip:  { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 5, marginRight: 4, marginBottom: 4 },
  skillChipTx:{ fontSize: 7.5, color: '#fff' },
  langName:   { fontSize: 8, fontFamily: 'Inter', fontWeight: 600, color: '#fff', marginBottom: 1 },
  langLevel:  { fontSize: 7, color: '#fff', opacity: 0.7, marginBottom: 6 },
  mainTitle:  { fontSize: 8, fontFamily: 'Inter', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 3 },
  mainDivider:{ height: 1, marginBottom: 9, borderRadius: 1 },
  expTitle:   { fontSize: 9.5, fontFamily: 'Inter', fontWeight: 700, color: '#111', marginBottom: 1 },
  expCompany: { fontSize: 8.5, fontFamily: 'Inter', fontWeight: 600, marginBottom: 1 },
  expDate:    { fontSize: 7.5, color: '#888' },
  expDesc:    { fontSize: 8, color: '#3a4150', marginTop: 3, lineHeight: 1.55 },
  expBlock:   { marginBottom: 11 },
  summary:    { fontSize: 8.5, color: '#3a4150', lineHeight: 1.6, marginBottom: 2 },
});

// Regroupe les compétences par catégorie (ordre d'apparition préservé).
function groupSkills(skills) {
  const groups = [];
  const index = {};
  skills.forEach((s) => {
    const nm = (s.name || '').trim();
    if (!nm) return;
    const cat = (s.category || '').trim() || 'Autres';
    if (!(cat in index)) { index[cat] = groups.length; groups.push({ cat, items: [] }); }
    groups[index[cat]].items.push(nm);
  });
  return groups;
}

export function ModernPDFTemplate({ cvData }) {
  const {
    personalInfo: p, experiences, education, skills, languages, projects,
    certifications = [], interests = [], achievements = [], distinctions = [],
    meta,
  } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';
  const skillGroups = groupSkills(skills);

  const SideSection = ({ title, children }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.sectionLbl}>{title}</Text>
      <View style={styles.divider} />
      {children}
    </View>
  );

  const MainSection = ({ title, children }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.mainTitle, { color: primary }]}>{title}</Text>
      <View style={[styles.mainDivider, { backgroundColor: primary, opacity: 0.3 }]} />
      {children}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={[styles.sidebar, { backgroundColor: primary }]}>
          {p.photo && (
            <Image src={p.photo} style={styles.avatar} />
          )}
          <Text style={[styles.name, { textAlign: 'center' }]}>{p.firstName} {p.lastName}</Text>
          {p.title && <Text style={[styles.title, { textAlign: 'center' }]}>{p.title}</Text>}

          {(p.email || p.phone || p.location || p.website) && (
            <SideSection title="Contact">
              {p.email    && <Text style={styles.contactTxt}>{p.email}</Text>}
              {p.phone    && <Text style={[styles.contactTxt, { marginTop: 2 }]}>{p.phone}</Text>}
              {p.location && <Text style={[styles.contactTxt, { marginTop: 2 }]}>{p.location}</Text>}
              {p.website  && <Text style={[styles.contactTxt, { marginTop: 2 }]}>{p.website}</Text>}
              {p.linkedin && <Text style={[styles.contactTxt, { marginTop: 2 }]}>{p.linkedin}</Text>}
              {p.github   && <Text style={[styles.contactTxt, { marginTop: 2 }]}>{p.github}</Text>}
            </SideSection>
          )}

          {skillGroups.length > 0 && (
            <SideSection title="Compétences">
              {skillGroups.map((g) => (
                <View key={g.cat} wrap={false} style={{ marginBottom: 3 }}>
                  {skillGroups.length > 1 && <Text style={styles.skillCat}>{g.cat}</Text>}
                  <View style={styles.skillsWrap}>
                    {g.items.map((name, i) => (
                      <View key={i} style={styles.skillChip}>
                        <Text style={styles.skillChipTx}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </SideSection>
          )}

          {languages.length > 0 && (
            <SideSection title="Langues">
              {languages.map((lang) => (
                <View key={lang.id}>
                  <Text style={styles.langName}>{lang.name}</Text>
                  <Text style={styles.langLevel}>{lang.level}</Text>
                </View>
              ))}
            </SideSection>
          )}

          {interests.length > 0 && (
            <SideSection title="Centres d'intérêt">
              {interests.map((it) => (
                <Text key={it.id} style={[styles.contactTxt, { marginTop: 2 }]}>
                  {it.name}{it.category ? ` — ${it.category}` : ''}
                </Text>
              ))}
            </SideSection>
          )}
        </View>

        {/* Main */}
        <View style={styles.main}>
          {p.summary && (
            <MainSection title="Profil">
              <Text style={styles.summary}>{p.summary}</Text>
            </MainSection>
          )}

          {experiences.length > 0 && (
            <MainSection title="Expérience professionnelle">
              {experiences.map((exp) => (
                <View key={exp.id} style={styles.expBlock}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.expTitle}>{exp.position}</Text>
                    <Text style={styles.expDate}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Text>
                  </View>
                  <Text style={[styles.expCompany, { color: primary }]}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</Text>
                  {exp.description && <Text style={styles.expDesc}>{exp.description}</Text>}
                </View>
              ))}
            </MainSection>
          )}

          {education.length > 0 && (
            <MainSection title="Formation">
              {education.map((edu) => (
                <View key={edu.id} style={[styles.expBlock, { marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.expTitle}>{edu.degree}</Text>
                    <Text style={styles.expDate}>{formatDateRange(edu.startDate, edu.endDate, false)}</Text>
                  </View>
                  <Text style={[styles.expCompany, { color: primary }]}>{edu.school}</Text>
                  {edu.field && <Text style={[styles.expDate, { marginTop: 1 }]}>{edu.field}</Text>}
                </View>
              ))}
            </MainSection>
          )}

          {projects.length > 0 && (
            <MainSection title="Projets">
              {projects.map((proj) => (
                <View key={proj.id} style={[styles.expBlock, { marginBottom: 8 }]}>
                  <Text style={styles.expTitle}>{proj.name}</Text>
                  {proj.technologies && <Text style={[styles.expCompany, { color: primary }]}>{proj.technologies}</Text>}
                  {proj.description && <Text style={styles.expDesc}>{proj.description}</Text>}
                </View>
              ))}
            </MainSection>
          )}

          {certifications.length > 0 && (
            <MainSection title="Certifications">
              {certifications.map((c) => (
                <View key={c.id} style={[styles.expBlock, { marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.expTitle}>{c.name}</Text>
                    <Text style={styles.expDate}>{formatDateRange(c.date, c.expiryDate, false)}</Text>
                  </View>
                  {c.issuer && (
                    <Text style={[styles.expCompany, { color: primary }]}>
                      {c.issuer}{c.credentialId ? ` · N° ${c.credentialId}` : ''}
                    </Text>
                  )}
                </View>
              ))}
            </MainSection>
          )}

          {achievements.length > 0 && (
            <MainSection title="Palmarès sportif">
              {achievements.map((a) => (
                <View key={a.id} style={[styles.expBlock, { marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.expTitle}>
                      {a.rank ? `${a.rank} — ` : ''}{a.title}
                    </Text>
                    <Text style={styles.expDate}>{formatDateRange(a.date, '', false)}</Text>
                  </View>
                  {(a.competition || a.location) && (
                    <Text style={[styles.expCompany, { color: primary }]}>
                      {[a.competition, a.location].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                  {a.description && <Text style={styles.expDesc}>{a.description}</Text>}
                </View>
              ))}
            </MainSection>
          )}

          {distinctions.length > 0 && (
            <MainSection title="Distinctions & publications">
              {distinctions.map((d) => (
                <View key={d.id} style={[styles.expBlock, { marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.expTitle}>{d.title}</Text>
                    <Text style={styles.expDate}>{formatDateRange(d.date, '', false)}</Text>
                  </View>
                  <Text style={[styles.expCompany, { color: primary }]}>
                    {[d.type, d.issuer].filter(Boolean).join(' · ')}
                  </Text>
                  {d.description && <Text style={styles.expDesc}>{d.description}</Text>}
                </View>
              ))}
            </MainSection>
          )}
        </View>
      </Page>
    </Document>
  );
}
