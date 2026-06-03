import {
  Box, Typography, Grid, Card, CardActionArea,
  Stack, Select, MenuItem, FormControl, InputLabel, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import {
  CV_TEMPLATES, COLOR_PRESETS, FONT_OPTIONS, SECTION_LABELS, DEFAULT_SECTION_ORDER,
} from '@data/initialCVData';
import { resolveSectionOrder } from '@utils/cvHelpers';
import { alpha } from '@mui/material/styles';
import { tokens } from '@theme/tokens';

export default function CustomizationSection() {
  const { cvData, updateMeta } = useCV();
  const { meta } = cvData;
  const sectionOrder = resolveSectionOrder(meta, DEFAULT_SECTION_ORDER);

  const onSectionDragEnd = ({ source, destination }) => {
    if (!destination || destination.index === source.index) return;
    const next = Array.from(sectionOrder);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    updateMeta({ sectionOrder: next });
  };

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

      {/* Section order */}
      <Typography variant="subtitle2" fontWeight={600} mb={0.5} mt={3}>
        Ordre des sections
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        Glissez pour réordonner les sections de votre CV (ex. Formation avant Expérience).
      </Typography>
      <DragDropContext onDragEnd={onSectionDragEnd}>
        <Droppable droppableId="section-order">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {sectionOrder.map((key, idx) => (
                <Draggable key={key} draggableId={key} index={idx}>
                  {(drag, snapshot) => (
                    <Box
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      {...drag.dragHandleProps}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        px: 1.25, py: 0.9, mb: 0.6,
                        border: '1px solid', borderColor: 'divider', borderRadius: 1,
                        bgcolor: snapshot.isDragging ? alpha(tokens.colors.primary[900], 0.06) : 'background.paper',
                        cursor: 'grab', userSelect: 'none',
                        ...drag.draggableProps.style,
                      }}
                    >
                      <DragIndicatorIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                      <Typography variant="body2">{SECTION_LABELS[key] || key}</Typography>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
