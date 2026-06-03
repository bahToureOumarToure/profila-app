import { Fragment } from 'react';
import { Box, Typography } from '@mui/material';
import { formatDateRange, resolveSectionOrder, groupSkillsByCategory } from '@utils/cvHelpers';
import { DEFAULT_SECTION_ORDER } from '@data/initialCVData';

export default function MinimalTemplate({ cvData }) {
  const {
    personalInfo: p, experiences, education, skills, languages, projects,
    certifications = [], interests = [], achievements = [], distinctions = [],
    meta,
  } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';
  const fontFamily = meta?.fontFamily || 'Inter';
  const order = resolveSectionOrder(meta, DEFAULT_SECTION_ORDER);

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

  const sections = {
    summary: p.summary && (
      <Section title="À propos">
        <Typography sx={{ fontSize: '0.8rem', color: '#444', lineHeight: 1.75 }}>{p.summary}</Typography>
      </Section>
    ),
    experiences: experiences.length > 0 && (
      <Section title="Expérience">
        {experiences.map((exp, idx) => (
          <Box key={exp.id} sx={{ mb: idx < experiences.length - 1 ? 2 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{exp.position}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>{formatDateRange(exp.startDate, exp.endDate, exp.current)}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5 }}>
              {exp.company}{exp.location ? ` · ${exp.location}` : ''}
            </Typography>
            {exp.description && (
              <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{exp.description}</Typography>
            )}
          </Box>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Formation">
        {education.map((edu, idx) => (
          <Box key={edu.id} sx={{ mb: idx < education.length - 1 ? 1.25 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{edu.degree}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>{formatDateRange(edu.startDate, edu.endDate, false)}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{edu.school}{edu.field ? ` · ${edu.field}` : ''}</Typography>
          </Box>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Compétences">
        {(() => {
          const groups = groupSkillsByCategory(skills);
          const showCat = groups.length > 1;
          return groups.map((g) => (
            <Box key={g.cat} sx={{ mb: showCat ? 1 : 0 }}>
              {showCat && (
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#999',
                  textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.3 }}>
                  {g.cat}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
                {g.items.map((name, i) => (
                  <Typography key={i} sx={{ fontSize: '0.78rem', color: '#444' }}>{name}</Typography>
                ))}
              </Box>
            </Box>
          ));
        })()}
      </Section>
    ),
    languages: languages.length > 0 && (
      <Section title="Langues">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {languages.map((lang) => (
            <Box key={lang.id}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#333' }}>{lang.name}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#999' }}>{lang.level}</Typography>
            </Box>
          ))}
        </Box>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Projets">
        {projects.map((proj, idx) => (
          <Box key={proj.id} sx={{ mb: idx < projects.length - 1 ? 1.25 : 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{proj.name}</Typography>
            {proj.technologies && <Typography sx={{ fontSize: '0.7rem', color: '#999', mb: 0.25 }}>{proj.technologies}</Typography>}
            {proj.description && <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.65 }}>{proj.description}</Typography>}
          </Box>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map((c, idx) => (
          <Box key={c.id} sx={{ mb: idx < certifications.length - 1 ? 1 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{c.name}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>{formatDateRange(c.date, c.expiryDate, false)}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{c.issuer}{c.credentialId ? ` · N° ${c.credentialId}` : ''}</Typography>
          </Box>
        ))}
      </Section>
    ),
    achievements: achievements.length > 0 && (
      <Section title="Palmarès sportif">
        {achievements.map((a, idx) => (
          <Box key={a.id} sx={{ mb: idx < achievements.length - 1 ? 1 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{a.rank ? `${a.rank} — ` : ''}{a.title}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>{formatDateRange(a.date, '', false)}</Typography>
            </Box>
            {(a.competition || a.location) && (
              <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{[a.competition, a.location].filter(Boolean).join(' · ')}</Typography>
            )}
            {a.description && <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.6 }}>{a.description}</Typography>}
          </Box>
        ))}
      </Section>
    ),
    distinctions: distinctions.length > 0 && (
      <Section title="Distinctions & publications">
        {distinctions.map((d, idx) => (
          <Box key={d.id} sx={{ mb: idx < distinctions.length - 1 ? 1 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{d.title}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#aaa' }}>{formatDateRange(d.date, '', false)}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{[d.type, d.issuer].filter(Boolean).join(' · ')}</Typography>
            {d.description && <Typography sx={{ fontSize: '0.78rem', color: '#555', lineHeight: 1.6 }}>{d.description}</Typography>}
          </Box>
        ))}
      </Section>
    ),
    interests: interests.length > 0 && (
      <Section title="Centres d'intérêt">
        <Typography sx={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.7 }}>
          {interests.map((it) => it.name).filter(Boolean).join(' · ')}
        </Typography>
      </Section>
    ),
  };

  return (
    <Box sx={{ fontFamily, p: 3.5, minHeight: '297mm', bgcolor: '#fff', fontSize: '10pt', maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {p.firstName} {p.lastName}
        </Typography>
        {p.title && <Typography sx={{ fontSize: '0.88rem', color: primary, fontWeight: 500, mt: 0.5 }}>{p.title}</Typography>}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px', mt: 1 }}>
          {[p.email, p.phone, p.location].filter(Boolean).map((v, i) => (
            <Typography key={i} sx={{ fontSize: '0.72rem', color: '#777' }}>{v}</Typography>
          ))}
        </Box>
      </Box>

      {order.map((k) => sections[k] && <Fragment key={k}>{sections[k]}</Fragment>)}
    </Box>
  );
}
