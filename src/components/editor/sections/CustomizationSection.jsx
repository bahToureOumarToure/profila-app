import {
  Box, Typography, Grid, Card, CardActionArea, Stack, Select, MenuItem, FormControl, InputLabel,
  Tooltip, ToggleButtonGroup, ToggleButton, Slider, Switch, FormControlLabel, IconButton, InputBase, Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import {
  CV_TEMPLATES, COLOR_PRESETS, FONT_OPTIONS, SECTION_LABELS, DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_TITLES, DENSITY_OPTIONS, DATE_STYLES,
} from '@data/initialCVData';
import { resolveSectionOrder } from '@utils/cvHelpers';
import { alpha } from '@mui/material/styles';
import { tokens } from '@theme/tokens';

const Label = ({ children, hint }) => (
  <Box mb={1} mt={3}>
    <Typography variant="subtitle2" fontWeight={600}>{children}</Typography>
    {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
  </Box>
);

export default function CustomizationSection() {
  const { cvData, updateMeta } = useCV();
  const { meta } = cvData;
  const sectionOrder = resolveSectionOrder(meta, DEFAULT_SECTION_ORDER);
  const hidden = meta.hiddenSections || [];
  const titles = meta.sectionTitles || {};

  const onSectionDragEnd = ({ source, destination }) => {
    if (!destination || destination.index === source.index) return;
    const next = Array.from(sectionOrder);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    updateMeta({ sectionOrder: next });
  };

  const toggleHidden = (key) => updateMeta({
    hiddenSections: hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key],
  });

  const pickTemplate = (tpl) => {
    const preset = COLOR_PRESETS.find((c) => c.primary === tpl.defaultColor);
    updateMeta({
      template: tpl.id,
      fontFamily: tpl.defaultFont,
      colorScheme: { primary: tpl.defaultColor, secondary: preset?.secondary || tpl.defaultColor },
    });
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} mb={0.5}>Template</Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Tous les templates sont sur une colonne, avec du texte réel et des titres standards : lisibles par les ATS.
      </Typography>
      <Grid container spacing={1.5}>
        {CV_TEMPLATES.map((tpl) => {
          const selected = meta.template === tpl.id;
          return (
            <Grid item xs={12} sm={6} key={tpl.id}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px solid',
                  borderColor: selected ? tokens.colors.primary[900] : 'divider',
                  backgroundColor: selected ? alpha(tokens.colors.primary[900], 0.05) : 'background.paper',
                  transition: 'all 0.15s',
                }}
              >
                <CardActionArea onClick={() => pickTemplate(tpl)} sx={{ p: 1.5, height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: tpl.defaultColor }} />
                      <Typography variant="subtitle2" fontWeight={600}>{tpl.label}</Typography>
                    </Stack>
                    {selected && <CheckCircleIcon color="primary" fontSize="small" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {tpl.description}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: tpl.defaultFont, display: 'block', mt: 0.5 }}>
                    {tpl.defaultFont}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Label>Couleur des titres</Label>
      <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
        {COLOR_PRESETS.map((preset) => {
          const selected = meta.colorScheme?.primary === preset.primary;
          return (
            <Tooltip key={preset.primary} title={preset.name} arrow>
              <Box
                role="button"
                aria-label={`Couleur ${preset.name}`}
                onClick={() => updateMeta({ colorScheme: { primary: preset.primary, secondary: preset.secondary } })}
                sx={{
                  width: 30, height: 30, borderRadius: '50%',
                  backgroundColor: preset.primary, cursor: 'pointer',
                  outline: selected ? `2px solid ${preset.primary}` : 'none',
                  outlineOffset: '3px',
                  transition: 'transform 0.15s',
                  '&:hover': { transform: 'scale(1.12)' },
                }}
              />
            </Tooltip>
          );
        })}
        <Tooltip title="Couleur personnalisée" arrow>
          <Box
            component="input" type="color" aria-label="Couleur personnalisée"
            value={meta.colorScheme?.primary || '#15616d'}
            onChange={(e) => updateMeta({ colorScheme: { primary: e.target.value, secondary: e.target.value } })}
            sx={{ width: 34, height: 34, p: 0, border: 'none', bgcolor: 'transparent', cursor: 'pointer' }}
          />
        </Tooltip>
      </Stack>

      <Label>Typographie</Label>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={7}>
          <FormControl fullWidth size="small">
            <InputLabel>Police</InputLabel>
            <Select value={meta.fontFamily} label="Police" onChange={(e) => updateMeta({ fontFamily: e.target.value })}>
              {FONT_OPTIONS.map((f) => (
                <MenuItem key={f.value} value={f.value} sx={{ fontFamily: f.value }}>{f.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth size="small">
            <InputLabel>Dates</InputLabel>
            <Select value={meta.dateStyle} label="Dates" onChange={(e) => updateMeta({ dateStyle: e.target.value })}>
              {DATE_STYLES.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ px: 1, mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">Taille du texte : {Math.round((meta.fontScale || 1) * 100)} %</Typography>
        <Slider
          size="small" min={0.85} max={1.1} step={0.01}
          value={meta.fontScale || 1}
          onChange={(_, v) => updateMeta({ fontScale: v })}
          marks={[{ value: 1, label: '100 %' }]}
          aria-label="Taille du texte"
        />
      </Box>

      <Label hint="Réduit les interlignes et les marges entre les blocs.">Densité</Label>
      <ToggleButtonGroup
        exclusive size="small" fullWidth value={meta.density}
        onChange={(_, v) => v && updateMeta({ density: v })}
      >
        {DENSITY_OPTIONS.map((d) => <ToggleButton key={d.value} value={d.value}>{d.label}</ToggleButton>)}
      </ToggleButtonGroup>

      <Stack mt={2}>
        <FormControlLabel
          control={<Switch checked={meta.autoFit !== false} onChange={(e) => updateMeta({ autoFit: e.target.checked })} />}
          label={<Typography variant="body2">Ajuster automatiquement sur 1 page <Chip size="small" label="recommandé" sx={{ ml: 0.5, height: 18 }} /></Typography>}
        />
        <FormControlLabel
          control={<Switch checked={meta.showPhoto !== false} onChange={(e) => updateMeta({ showPhoto: e.target.checked })} />}
          label={<Typography variant="body2">Afficher la photo (si le template le permet)</Typography>}
        />
        <FormControlLabel
          control={<Switch checked={meta.showIcons !== false} onChange={(e) => updateMeta({ showIcons: e.target.checked })} />}
          label={<Typography variant="body2">Icônes devant les coordonnées</Typography>}
        />
      </Stack>

      <Label hint="Glissez pour réordonner, l'œil masque une section sans perdre son contenu, cliquez sur un titre pour le renommer.">
        Sections
      </Label>
      <DragDropContext onDragEnd={onSectionDragEnd}>
        <Droppable droppableId="section-order">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {sectionOrder.map((key, idx) => {
                const isHidden = hidden.includes(key);
                return (
                  <Draggable key={key} draggableId={key} index={idx}>
                    {(drag, snapshot) => (
                      <Box
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1,
                          px: 1, py: 0.5, mb: 0.6,
                          border: '1px solid', borderColor: 'divider', borderRadius: 1,
                          bgcolor: snapshot.isDragging ? alpha(tokens.colors.primary[900], 0.06) : 'background.paper',
                          opacity: isHidden ? 0.55 : 1,
                          ...drag.draggableProps.style,
                        }}
                      >
                        <Box {...drag.dragHandleProps} sx={{ display: 'flex', cursor: 'grab', color: 'text.disabled' }}>
                          <DragIndicatorIcon fontSize="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <InputBase
                            fullWidth
                            value={titles[key] ?? ''}
                            placeholder={DEFAULT_SECTION_TITLES[key]}
                            onChange={(e) => updateMeta({ sectionTitles: { ...titles, [key]: e.target.value } })}
                            inputProps={{ 'aria-label': `Titre de la section ${SECTION_LABELS[key]}` }}
                            sx={{ fontSize: '0.875rem', '& input::placeholder': { opacity: 0.9 } }}
                          />
                        </Box>
                        <Tooltip title={isHidden ? 'Afficher la section' : 'Masquer la section'}>
                          <IconButton size="small" onClick={() => toggleHidden(key)}>
                            {isHidden ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
