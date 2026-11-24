import {
  Grid, TextField, Box, Typography, MenuItem, Slider, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { EMPTY_ITEMS } from '@data/initialCVData';
import {
  CEFR_LEVELS, DESCRIPTOR_OPTIONS, cefrRange, cefrDescriptor, formatCefr, formatLanguageLevel,
} from '@utils/languageLevel';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';

const MARKS = CEFR_LEVELS.map((label, value) => ({ value, label }));

// Un curseur à deux poignées : les poignées confondues donnent un niveau unique (« B2 »),
// écartées une plage (« A2/B1 ») pour qui se situe entre deux niveaux.
function LanguageFields({ lang, onChange }) {
  const [min, max] = cefrRange(lang.cefrMin, lang.cefrMax);
  const range = [CEFR_LEVELS.indexOf(min || 'B1'), CEFR_LEVELS.indexOf(max || 'B2')];
  const mode = lang.nativeLevel || 'cefr';
  const auto = cefrDescriptor(min, max);
  // Un qualificatif saisi par l'assistant IA hors de la liste reste sélectionnable.
  const options = lang.label && lang.label !== 'none' && !DESCRIPTOR_OPTIONS.includes(lang.label)
    ? [lang.label, ...DESCRIPTOR_OPTIONS] : DESCRIPTOR_OPTIONS;

  return (
    <Grid container spacing={2} mt={0}>
      <Grid item xs={12}>
        <TextField fullWidth label="Langue" placeholder="ex. Anglais" value={lang.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Grid>
      <Grid item xs={12}>
        <ToggleButtonGroup
          exclusive fullWidth size="small" value={mode}
          onChange={(_, v) => v && onChange({ nativeLevel: v === 'cefr' ? '' : v })}
        >
          <ToggleButton value="cefr">Niveau A1 → C2</ToggleButton>
          <ToggleButton value="Langue maternelle">Langue maternelle</ToggleButton>
          <ToggleButton value="Bilingue">Bilingue</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      {mode === 'cefr' && (
        <>
          <Grid item xs={12}>
            <Box sx={{ px: 1.5 }}>
              <Slider
                value={range} min={0} max={CEFR_LEVELS.length - 1} step={1} marks={MARKS}
                onChange={(_, v) => onChange({ cefrMin: CEFR_LEVELS[v[0]], cefrMax: CEFR_LEVELS[v[1]] })}
                getAriaLabel={(i) => (i === 0 ? 'Niveau minimum' : 'Niveau maximum')}
                getAriaValueText={(v) => CEFR_LEVELS[v]}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Rapprochez les deux curseurs pour un niveau unique, écartez-les si vous êtes entre deux niveaux.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select fullWidth size="small" label="Qualificatif" value={lang.label || ''}
              onChange={(e) => onChange({ label: e.target.value })}
            >
              <MenuItem value="">Automatique ({auto})</MenuItem>
              <MenuItem value="none">Aucun (niveau seul)</MenuItem>
              {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
          </Grid>
        </>
      )}
      <Grid item xs={12} sm={mode === 'cefr' ? 6 : 12}>
        <TextField
          fullWidth size="small" label="Précision (facultatif)"
          placeholder="ex. bonne compréhension écrite (documentation technique)"
          value={lang.note} onChange={(e) => onChange({ note: e.target.value })}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary">
          Aperçu : <strong>{lang.name || 'Langue'}</strong>
          {formatLanguageLevel(lang) ? ` : ${formatLanguageLevel(lang)}` : ''}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default function LanguagesSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { languages } = cvData;

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('languages', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Langues (${languages.length})`}
        onAdd={() => addItem('languages', EMPTY_ITEMS.languages)}
        addLabel="Ajouter une langue"
      />
      {languages.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune langue-cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="languages">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {languages.map((lang, idx) => (
                <Draggable key={lang.id} draggableId={lang.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={lang.name || 'Nouvelle langue'}
                        subtitle={lang.nativeLevel || [cefrDescriptor(lang.cefrMin, lang.cefrMax), formatCefr(lang.cefrMin, lang.cefrMax)].filter(Boolean).join(' – ')}
                        onDelete={() => removeItem('languages', lang.id)}
                        defaultExpanded={languages.length === 1 || !lang.name}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <LanguageFields lang={lang} onChange={(data) => updateItem('languages', lang.id, data)} />
                      </ItemCard>
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
