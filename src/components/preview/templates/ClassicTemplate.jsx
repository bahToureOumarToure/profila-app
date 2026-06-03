import { Box, Typography, Divider } from '@mui/material';
import { formatDateRange } from '@utils/cvHelpers';

const SectionTitle = ({ children, color }) => (
  <Box sx={{ mb: 1.5, mt: 2 }}>
    <Typography sx={{
      fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase',
      letterSpacing: '0.12em', color,
    }}>
      {children}
    </Typography>
    <Divider sx={{ borderColor: color, borderBottomWidth: 2, mt: 0.5 }} />
  </Box>
);

export default function ClassicTemplate({ cvData }) {
  const {
    personalInfo: p, experiences, education, skills, languages, projects,
    certifications = [], interests = [], achievements = [], distinctions = [],
    meta,
  } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';
  const fontFamily = meta?.fontFamily || 'Inter';

  return (
    <Box sx={{ fontFamily, p: 3.5, minHeight: '297mm', bgcolor: '#fff', fontSize: '10pt' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2.5, pb: 2, borderBottom: `3px solid ${primary}` }}>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: primary, letterSpacing: '-0.02em' }}>
          {p.firstName} {p.lastName}
        </Typography>
        {p.title && (
          <Typography sx={{ fontSize: '0.9rem', color: '#555', mt: 0.5 }}>{p.title}</Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          {[p.email, p.phone, p.location, p.website, p.linkedin].filter(Boolean).map((v, i) => (
            <Typography key={i} variant="caption" sx={{ color: '#666', fontSize: '0.72rem' }}>{v}</Typography>
          ))}
        </Box>
      </Box>

      {p.summary && (
        <>
          <SectionTitle color={primary}>Résumé</SectionTitle>
          <Typography sx={{ fontSize: '0.8rem', color: '#444', lineHeight: 1.7, mb: 1 }}>{p.summary}</Typography>
        </>
      )}

      {experiences.length > 0 && (
        <>
          <SectionTitle color={primary}>Expérience professionnelle</SectionTitle>
          {experiences.map((exp, idx) => (
            <Box key={exp.id} sx={{ mb: idx < experiences.length - 1 ? 2 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{exp.position}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#777', ml: 1, flexShrink: 0 }}>
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: primary, fontWeight: 600 }}>
                {exp.company}{exp.location ? ` · ${exp.location}` : ''}
              </Typography>
              {exp.description && (
                <Typography sx={{ mt: 0.5, fontSize: '0.78rem', color: '#555', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {exp.description}
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {education.length > 0 && (
        <>
          <SectionTitle color={primary}>Formation</SectionTitle>
          {education.map((edu, idx) => (
            <Box key={edu.id} sx={{ mb: idx < education.length - 1 ? 1.5 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{edu.degree}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#777', ml: 1, flexShrink: 0 }}>
                  {formatDateRange(edu.startDate, edu.endDate, false)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: primary, fontWeight: 600 }}>{edu.school}</Typography>
              {edu.field && <Typography sx={{ fontSize: '0.73rem', color: '#666' }}>{edu.field}</Typography>}
            </Box>
          ))}
        </>
      )}

      {skills.length > 0 && (
        <>
          <SectionTitle color={primary}>Compétences</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {skills.map((skill) => (
              <Box key={skill.id} sx={{
                px: 1.25, py: 0.25, borderRadius: 1,
                border: `1px solid ${primary}`, display: 'inline-block',
              }}>
                <Typography sx={{ fontSize: '0.7rem', color: primary, fontWeight: 500 }}>{skill.name}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {languages.length > 0 && (
        <>
          <SectionTitle color={primary}>Langues</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {languages.map((lang) => (
              <Box key={lang.id}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#111' }}>{lang.name}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#777' }}>{lang.level}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {projects.length > 0 && (
        <>
          <SectionTitle color={primary}>Projets</SectionTitle>
          {projects.map((proj, idx) => (
            <Box key={proj.id} sx={{ mb: idx < projects.length - 1 ? 1.5 : 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{proj.name}</Typography>
              {proj.technologies && (
                <Typography sx={{ fontSize: '0.7rem', color: primary, fontWeight: 500 }}>{proj.technologies}</Typography>
              )}
              {proj.description && (
                <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.65 }}>{proj.description}</Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {certifications.length > 0 && (
        <>
          <SectionTitle color={primary}>Certifications</SectionTitle>
          {certifications.map((c, idx) => (
            <Box key={c.id} sx={{ mb: idx < certifications.length - 1 ? 1.25 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{c.name}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#777' }}>
                  {formatDateRange(c.date, c.expiryDate, false)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: primary, fontWeight: 600 }}>
                {c.issuer}{c.credentialId ? ` · N° ${c.credentialId}` : ''}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {achievements.length > 0 && (
        <>
          <SectionTitle color={primary}>Palmarès sportif</SectionTitle>
          {achievements.map((a, idx) => (
            <Box key={a.id} sx={{ mb: idx < achievements.length - 1 ? 1.25 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>
                  {a.rank ? `${a.rank} — ` : ''}{a.title}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#777' }}>{formatDateRange(a.date, '', false)}</Typography>
              </Box>
              {(a.competition || a.location) && (
                <Typography sx={{ fontSize: '0.78rem', color: primary, fontWeight: 600 }}>
                  {[a.competition, a.location].filter(Boolean).join(' · ')}
                </Typography>
              )}
              {a.description && (
                <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.6 }}>{a.description}</Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {distinctions.length > 0 && (
        <>
          <SectionTitle color={primary}>Distinctions & publications</SectionTitle>
          {distinctions.map((d, idx) => (
            <Box key={d.id} sx={{ mb: idx < distinctions.length - 1 ? 1.25 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{d.title}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#777' }}>{formatDateRange(d.date, '', false)}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: primary, fontWeight: 600 }}>
                {[d.type, d.issuer].filter(Boolean).join(' · ')}
              </Typography>
              {d.description && (
                <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.6 }}>{d.description}</Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {interests.length > 0 && (
        <>
          <SectionTitle color={primary}>Centres d'intérêt</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {interests.map((it) => (
              <Box key={it.id} sx={{
                px: 1.25, py: 0.25, borderRadius: 1,
                border: `1px solid ${primary}`, display: 'inline-block',
              }}>
                <Typography sx={{ fontSize: '0.7rem', color: primary, fontWeight: 500 }}>
                  {it.name}{it.category ? ` (${it.category})` : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
