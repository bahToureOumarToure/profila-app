import { useMemo } from 'react';
import {
  Paper, Box, Typography, Stack, List, ListItemButton, ListItemIcon, ListItemText, Chip, LinearProgress, Alert,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useCV } from '@context/CVContext';
import { analyzeATS } from '@utils/atsCheck';
import { getLayoutInfo } from '@components/pdf/layoutInfo';

const ICON = {
  error: <ErrorOutlineIcon color="error" fontSize="small" />,
  warning: <WarningAmberIcon color="warning" fontSize="small" />,
  info: <InfoOutlinedIcon color="info" fontSize="small" />,
};

export const scoreColor = (s) => (s >= 85 ? 'success' : s >= 65 ? 'warning' : 'error');

// Analyse locale et instantanée : aucune donnée envoyée, aucune clé API requise.
export default function ATSPanel({ onNavigate }) {
  const { cvData } = useCV();
  const { score, checks, counts } = useMemo(
    () => analyzeATS(cvData, { pages: getLayoutInfo()?.pages }),
    [cvData],
  );

  return (
    <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={700}>Analyse ATS</Typography>
          <Typography variant="h4" fontWeight={800} color={`${scoreColor(score)}.main`}>
            {score}<Typography component="span" variant="body2" color="text.secondary"> / 100</Typography>
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={score} color={scoreColor(score)} sx={{ my: 1, height: 6, borderRadius: 3 }} />
        <Stack direction="row" spacing={1}>
          <Chip size="small" color="error" variant="outlined" label={`${counts.error} bloquant(s)`} />
          <Chip size="small" color="warning" variant="outlined" label={`${counts.warning} à corriger`} />
          <Chip size="small" color="info" variant="outlined" label={`${counts.info} conseil(s)`} />
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Vérification locale de la structure, des dates, des coordonnées et de la rédaction.
          Pour la compatibilité avec une offre précise, utilisez l'assistant ou le Coach IA.
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {checks.length === 0 ? (
          <Alert icon={<TaskAltIcon />} severity="success" sx={{ m: 2 }}>
            Aucun problème détecté : votre CV respecte les bonnes pratiques ATS.
          </Alert>
        ) : (
          <List dense disablePadding>
            {checks.map((c, i) => (
              <ListItemButton key={i} onClick={() => onNavigate?.(c.tab)} divider alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{ICON[c.level]}</ListItemIcon>
                <ListItemText
                  primary={c.message}
                  secondary={c.tip || null}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
