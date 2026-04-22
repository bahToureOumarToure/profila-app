import { Box, Typography, Avatar, Chip, LinearProgress, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkIcon from '@mui/icons-material/Link';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import { getInitials, formatDateRange } from '@utils/cvHelpers';
import { alpha } from '@mui/material/styles';

const ContactItem = ({ icon, value }) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
      <Box sx={{ opacity: 0.7, display: 'flex' }}>{icon}</Box>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </Box>
  );
};

const SectionTitle = ({ children, color }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="overline" sx={{ fontWeight: 700, color, letterSpacing: '0.1em', fontSize: '0.65rem' }}>
      {children}
    </Typography>
    <Divider sx={{ borderColor: color, opacity: 0.3, mt: 0.25 }} />
  </Box>
);

export default function ModernTemplate({ cvData }) {
  const { personalInfo: p, experiences, education, skills, languages, projects, meta } = cvData;
  const primary = meta?.colorScheme?.primary || '#1a237e';
  const fontFamily = meta?.fontFamily || 'Inter';

  return (
    <Box sx={{ fontFamily, display: 'flex', minHeight: '297mm', fontSize: '10pt', bgcolor: '#fff' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '33%', minWidth: '33%',
          backgroundColor: primary,
          color: '#fff',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Photo + Name */}
        <Box textAlign="center">
          <Avatar
            src={p.photo || undefined}
            sx={{ width: 88, height: 88, mx: 'auto', mb: 1.5, border: '3px solid rgba(255,255,255,0.3)', fontSize: '1.5rem', bgcolor: alpha('#fff', 0.2) }}
          >
            {!p.photo && getInitials(p.firstName, p.lastName)}
          </Avatar>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2, fontSize: '1rem' }}>
            {p.firstName} {p.lastName}
          </Typography>
          {p.title && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25, display: 'block', fontSize: '0.7rem' }}>
              {p.title}
            </Typography>
          )}
        </Box>

        {/* Contact */}
        {(p.email || p.phone || p.location || p.website || p.linkedin || p.github) && (
          <Box>
            <SectionTitle color="#fff">Contact</SectionTitle>
            <ContactItem icon={<EmailIcon sx={{ fontSize: 12 }} />} value={p.email} />
            <ContactItem icon={<PhoneIcon sx={{ fontSize: 12 }} />} value={p.phone} />
            <ContactItem icon={<LocationOnIcon sx={{ fontSize: 12 }} />} value={p.location} />
            <ContactItem icon={<LinkIcon sx={{ fontSize: 12 }} />} value={p.website} />
            <ContactItem icon={<LinkedInIcon sx={{ fontSize: 12 }} />} value={p.linkedin} />
            <ContactItem icon={<GitHubIcon sx={{ fontSize: 12 }} />} value={p.github} />
          </Box>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Box>
            <SectionTitle color="#fff">Compétences</SectionTitle>
            {skills.map((skill) => (
              <Box key={skill.id} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.7rem' }}>{skill.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem' }}>
                    {skill.level}/5
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(skill.level / 5) * 100}
                  sx={{
                    height: 4, borderRadius: 2,
                    backgroundColor: alpha('#fff', 0.2),
                    '& .MuiLinearProgress-bar': { backgroundColor: '#fff', borderRadius: 2 },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <Box>
            <SectionTitle color="#fff">Langues</SectionTitle>
            {languages.map((lang) => (
              <Box key={lang.id} sx={{ mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}>{lang.name}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block', fontSize: '0.65rem' }}>{lang.level}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Summary */}
        {p.summary && (
          <Box>
            <SectionTitle color={primary}>Profil</SectionTitle>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#333', fontSize: '0.8rem' }}>
              {p.summary}
            </Typography>
          </Box>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <Box>
            <SectionTitle color={primary}>Expérience professionnelle</SectionTitle>
            {experiences.map((exp, idx) => (
              <Box key={exp.id} sx={{ mb: idx < experiences.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{exp.position}</Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.78rem', color: primary }}>{exp.company}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: '#777', mt: 0.25 }}>
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    {exp.location && ` · ${exp.location}`}
                  </Typography>
                </Box>
                {exp.description && (
                  <Typography sx={{ mt: 0.75, fontSize: '0.78rem', color: '#444', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                    {exp.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Box>
            <SectionTitle color={primary}>Formation</SectionTitle>
            {education.map((edu, idx) => (
              <Box key={edu.id} sx={{ mb: idx < education.length - 1 ? 1.5 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{edu.degree}</Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.78rem', color: primary }}>{edu.school}</Typography>
                    {edu.field && <Typography sx={{ fontSize: '0.73rem', color: '#666' }}>{edu.field}</Typography>}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: '#777', mt: 0.25 }}>
                    {formatDateRange(edu.startDate, edu.endDate, false)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Box>
            <SectionTitle color={primary}>Projets</SectionTitle>
            {projects.map((proj, idx) => (
              <Box key={proj.id} sx={{ mb: idx < projects.length - 1 ? 1.5 : 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{proj.name}</Typography>
                {proj.technologies && (
                  <Typography sx={{ fontSize: '0.7rem', color: primary, fontWeight: 500, mb: 0.5 }}>
                    {proj.technologies}
                  </Typography>
                )}
                {proj.description && (
                  <Typography sx={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.65 }}>
                    {proj.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
