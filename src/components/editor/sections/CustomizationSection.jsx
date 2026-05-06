import {
  Box, Typography, Grid, Card, CardActionArea,
  Stack, Select, MenuItem, FormControl, InputLabel, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCV } from '@context/CVContext';
import { CV_TEMPLATES, COLOR_PRESETS, FONT_OPTIONS } from '@data/initialCVData';
import { alpha } from '@mui/material/styles';
import { tokens } from '@theme/tokens';

export default function CustomizationSection() {
  const { cvData, updateMeta } = useCV();
  const { meta } = cvData;

  return (
    <Box>
      {/* Templates */}
      <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
        Template
      </Typography>
      <Grid container spacing={1.5} mb={3}>
        {CV_TEMPLATES.map((tpl) => {
          const selected = meta.template === tpl.id;
          return (
            <Grid item xs={12} sm={4} key={tpl.id}>
              <Card
                sx={{
                  border: '2px solid',
                  borderColor: selected ? tokens.colors.primary[900] : 'divider',
                  backgroundColor: selected ? alpha(tokens.colors.primary[900], 0.05) : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <CardActionArea onClick={() => updateMeta({ template: tpl.id })} sx={{ p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle2" fontWeight={600}>{tpl.label}</Typography>
                    {selected && <CheckCircleIcon color="primary" fontSize="small" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {tpl.description}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Color presets */}
      <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
        Couleur principale
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" mb={3} gap={1}>
        {COLOR_PRESETS.map((preset) => {
          const selected = meta.colorScheme?.primary === preset.primary;
          return (
            <Tooltip key={preset.primary} title={preset.name} arrow>
              <Box
                onClick={() => updateMeta({ colorScheme: { primary: preset.primary, secondary: preset.secondary } })}
                sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: preset.primary, cursor: 'pointer',
                  border: selected ? '3px solid' : '2px solid transparent',
                  borderColor: selected ? 'text.primary' : 'transparent',
                  outline: selected ? `2px solid ${preset.primary}` : 'none',
                  outlineOffset: '2px',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'scale(1.15)' },
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>

      {/* Font */}
      <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
        Police d'écriture
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel>Police</InputLabel>
        <Select
          value={meta.fontFamily || 'Inter'}
          label="Police"
          onChange={(e) => updateMeta({ fontFamily: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value }}>
              {f.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
