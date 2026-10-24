import { useMemo, useState } from 'react';
import { Box, Tabs, Tab, Paper, LinearProgress, Typography, Tooltip, ButtonBase } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LanguageIcon from '@mui/icons-material/Language';
import CodeIcon from '@mui/icons-material/Code';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PersonalInfoSection from './sections/PersonalInfoSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import LanguagesSection from './sections/LanguagesSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import InterestsSection from './sections/InterestsSection';
import AchievementsSection from './sections/AchievementsSection';
import DistinctionsSection from './sections/DistinctionsSection';
import CustomizationSection from './sections/CustomizationSection';
import { useCV } from '@context/CVContext';
import { analyzeATS } from '@utils/atsCheck';
import { scoreColor } from './ATSPanel';
import { getLayoutInfo } from '@components/pdf/layoutInfo';

const SECTIONS = [
  { id: 'personal',       label: 'Infos',           icon: <PersonOutlineIcon fontSize="small" /> },
  { id: 'experience',     label: 'Expérience',      icon: <WorkOutlineIcon fontSize="small" /> },
  { id: 'education',      label: 'Formation',       icon: <SchoolOutlinedIcon fontSize="small" /> },
  { id: 'skills',         label: 'Compétences',     icon: <StarBorderIcon fontSize="small" /> },
  { id: 'languages',      label: 'Langues',         icon: <LanguageIcon fontSize="small" /> },
  { id: 'projects',       label: 'Projets',         icon: <CodeIcon fontSize="small" /> },
  { id: 'certifications', label: 'Certifications',  icon: <WorkspacePremiumOutlinedIcon fontSize="small" /> },
  { id: 'achievements',   label: 'Compétitions',        icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
  { id: 'distinctions',   label: 'Distinctions',    icon: <MilitaryTechOutlinedIcon fontSize="small" /> },
  { id: 'interests',      label: 'Intérêts',        icon: <FavoriteBorderIcon fontSize="small" /> },
  { id: 'customization',  label: 'Design',          icon: <PaletteOutlinedIcon fontSize="small" /> },
];

const SECTION_COMPONENTS = {
  personal:       <PersonalInfoSection />,
  experience:     <ExperienceSection />,
  education:      <EducationSection />,
  skills:         <SkillsSection />,
  languages:      <LanguagesSection />,
  projects:       <ProjectsSection />,
  certifications: <CertificationsSection />,
  achievements:   <AchievementsSection />,
  distinctions:   <DistinctionsSection />,
  interests:      <InterestsSection />,
  customization:  <CustomizationSection />,
};

// L'onglet actif peut être piloté par le parent (ex. clic sur un constat ATS).
export default function EditorPanel({ activeSection: controlled, onSectionChange, onOpenATS }) {
  const [internal, setInternal] = useState('personal');
  const activeSection = controlled ?? internal;
  const setActiveSection = onSectionChange ?? setInternal;
  const { cvData } = useCV();
  const { score } = useMemo(() => analyzeATS(cvData, { pages: getLayoutInfo()?.pages }), [cvData]);

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
      {/* Score ATS (analyse locale) */}
      <Tooltip title="Voir le détail de l'analyse ATS" placement="bottom-start">
        <ButtonBase onClick={onOpenATS} sx={{ display: 'block', textAlign: 'left', px: 2, pt: 1.5, pb: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Score ATS</Typography>
            <Typography variant="caption" fontWeight={600} color={`${scoreColor(score)}.main`}>
              {score} / 100
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={score} color={scoreColor(score)} />
        </ButtonBase>
      </Tooltip>

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
