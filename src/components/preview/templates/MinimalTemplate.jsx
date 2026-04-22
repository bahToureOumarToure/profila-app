import { Box, Typography } from '@mui/material';
import { formatDateRange } from '@utils/cvHelpers';

export default function MinimalTemplate({ cvData }) {
  const { personalInfo: p, experiences, education, skills, languages, projects, meta } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';
  const fontFamily = meta?.fontFamily || 'Inter';

  const Section = ({ title, children }) => (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ width: 20, height: 2, backgroundColor: primary, flexShrink: 0 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: primary }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );

  return (
    <Box sx={{ fontFamily, p: 3.5, minHeight: '297mm', bgcolor: '#fff', fontSize: '10pt', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {p.firstName} {p.lastName}
        </Typography>
        {p.title && (
          <Typography sx={{ fontSize: '0.88rem', color: primary, fontWeight: 500, mt: 0.5 }}>{p.title}</Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px', mt: 1 }}>
          {[p.email, p.phone, p.location].filter(Boolean).map((v, i) => (
            <Typography key={i} sx={{ fontSize: '0.72rem', color: '#777' }}>{v}</Typography>
          ))}
        </Box>
      </Box>

      {p.summary && (
        <Section title="À propos">
          <Typography sx={{ fontSize: '0.8rem', color: '#444', lineHeight: 1.75 }}>{p.summary}</Typography>
        </Section>
      )}

      {experiences.length > 0 && (
        <Section title="Expérience">
          {experiences.map((exp, idx) => (
            <Box key={exp.id} sx={{ mb: idx < experiences.length - 1 ? 2 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{exp.position}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5 }}>
                {exp.company}{exp.location ? `-${exp.location}` : ''}
              </Typography>
              {exp.description && (
                <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {exp.description}
                </Typography>
              )}
            </Box>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Formation">
          {education.map((edu, idx) => (
            <Box key={edu.id} sx={{ mb: idx < education.length - 1 ? 1.25 : 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{edu.degree}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>
                  {formatDateRange(edu.startDate, edu.endDate, false)}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>
                {edu.school}{edu.field ? ` · ${edu.field}` : ''}
              </Typography>
            </Box>
          ))}
        </Section>
      )}

      <Box sx={{ display: 'flex', gap: 4 }}>
        {skills.length > 0 && (
          <Box sx={{ flex: 1 }}>
            <Section title="Compétences">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {skills.map((skill) => (
                  <Typography key={skill.id} sx={{ fontSize: '0.78rem', color: '#444' }}>
                    {skill.name}
                  </Typography>
                ))}
              </Box>
            </Section>
          </Box>
        )}

        {languages.length > 0 && (
          <Box>
            <Section title="Langues">
              {languages.map((lang) => (
                <Box key={lang.id} sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#333' }}>{lang.name}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{lang.level}</Typography>
                </Box>
              ))}
            </Section>
          </Box>
        )}
      </Box>

      {projects.length > 0 && (
        <Section title="Projets">
          {projects.map((proj, idx) => (
            <Box key={proj.id} sx={{ mb: idx < projects.length - 1 ? 1.25 : 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{proj.name}</Typography>
              {proj.technologies && <Typography sx={{ fontSize: '0.7rem', color: '#999', mb: 0.25 }}>{proj.technologies}</Typography>}
              {proj.description && <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.65 }}>{proj.description}</Typography>}
            </Box>
          ))}
        </Section>
      )}
    </Box>
  );
}
