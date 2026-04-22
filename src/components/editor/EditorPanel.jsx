import { useState } from 'react';
import { Box, Tabs, Tab, Paper, LinearProgress, Typography, Tooltip } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LanguageIcon from '@mui/icons-material/Language';
import CodeIcon from '@mui/icons-material/Code';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PersonalInfoSection from './sections/PersonalInfoSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import LanguagesSection from './sections/LanguagesSection';
import ProjectsSection from './sections/ProjectsSection';
import CustomizationSection from './sections/CustomizationSection';
import { useCV } from '@context/CVContext';
import { cvCompletionScore } from '@utils/cvHelpers';
import { tokens } from '@theme/tokens';

const SECTIONS = [
  { id: 'personal',      label: 'Infos',          icon: <PersonOutlineIcon fontSize="small" /> },
  { id: 'experience',    label: 'Expérience',      icon: <WorkOutlineIcon fontSize="small" /> },
  { id: 'education',     label: 'Formation',       icon: <SchoolOutlinedIcon fontSize="small" /> },
  { id: 'skills',        label: 'Compétences',     icon: <StarBorderIcon fontSize="small" /> },
  { id: 'languages',     label: 'Langues',         icon: <LanguageIcon fontSize="small" /> },
  { id: 'projects',      label: 'Projets',         icon: <CodeIcon fontSize="small" /> },
  { id: 'customization', label: 'Design',          icon: <PaletteOutlinedIcon fontSize="small" /> },
];

const SECTION_COMPONENTS = {
  personal:      <PersonalInfoSection />,
  experience:    <ExperienceSection />,
  education:     <EducationSection />,
  skills:        <SkillsSection />,
  languages:     <LanguagesSection />,
  projects:      <ProjectsSection />,
  customization: <CustomizationSection />,
};

export default function EditorPanel() {
  const [activeSection, setActiveSection] = useState('personal');
  const { cvData } = useCV();
  const score = cvCompletionScore(cvData);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Completion bar */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Complétion du CV</Typography>
          <Typography variant="caption" fontWeight={600} color={score >= 80 ? 'success.main' : 'primary.main'}>
            {score}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={score}
          color={score >= 80 ? 'success' : 'primary'}
        />
      </Box>

      {/* Section tabs */}
      <Tabs
        value={activeSection}
        onChange={(_, v) => setActiveSection(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 44,
          '& .MuiTab-root': { minHeight: 44, py: 0.5 },
        }}
      >
        {SECTIONS.map((s) => (
          <Tooltip key={s.id} title={s.label} placement="bottom" arrow>
            <Tab
              value={s.id}
              icon={s.icon}
              iconPosition="start"
              label={s.label}
              sx={{ fontSize: '0.78rem', gap: 0.5 }}
            />
          </Tooltip>
        ))}
      </Tabs>

      {/* Section content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
        {SECTION_COMPONENTS[activeSection]}
      </Box>
    </Paper>
  );
}
