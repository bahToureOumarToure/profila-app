import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDateRange } from '@utils/cvHelpers';

const styles = StyleSheet.create({
  page:       { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 9 },
  sidebar:    { width: '33%', minHeight: '100%', padding: 20, color: '#fff' },
  main:       { flex: 1, padding: 24 },
  name:       { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 2, color: '#fff' },
  title:      { fontSize: 8.5, marginBottom: 12, opacity: 0.8, color: '#fff' },
  avatar:     { width: 70, height: 70, borderRadius: 35, marginBottom: 10, alignSelf: 'center', objectFit: 'cover' },
  sectionLbl: { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3, opacity: 0.9 },
  divider:    { height: 0.5, backgroundColor: '#fff', opacity: 0.3, marginBottom: 6 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  contactTxt: { fontSize: 7.5, color: '#fff', opacity: 0.85 },
  skillRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  skillName:  { fontSize: 7.5, color: '#fff', fontFamily: 'Helvetica-Bold' },
  skillBar:   { height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 2, marginBottom: 5 },
  skillFill:  { height: 3, borderRadius: 1.5, backgroundColor: '#fff' },
  langName:   { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#fff', marginBottom: 1 },
  langLevel:  { fontSize: 7, color: '#fff', opacity: 0.65, marginBottom: 6 },
  mainTitle:  { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 },
  mainDivider:{ height: 0.5, marginBottom: 8 },
  expTitle:   { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111', marginBottom: 1 },
  expCompany: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  expDate:    { fontSize: 7, color: '#888' },
  expDesc:    { fontSize: 7.5, color: '#444', marginTop: 3, lineHeight: 1.5 },
  expBlock:   { marginBottom: 10 },
  summary:    { fontSize: 8, color: '#444', lineHeight: 1.6, marginBottom: 2 },
});

export function ModernPDFTemplate({ cvData }) {
  const { personalInfo: p, experiences, education, skills, languages, projects, meta } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';

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

          {skills.length > 0 && (
            <SideSection title="Compétences">
              {skills.map((skill) => (
                <View key={skill.id}>
                  <View style={styles.skillRow}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={[styles.contactTxt, { opacity: 0.65, fontSize: 7 }]}>{skill.level}/5</Text>
                  </View>
                  <View style={styles.skillBar}>
                    <View style={[styles.skillFill, { width: `${(skill.level / 5) * 100}%` }]} />
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
        </View>
      </Page>
    </Document>
  );
}
