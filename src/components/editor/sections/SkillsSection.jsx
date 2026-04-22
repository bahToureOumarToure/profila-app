import {
  Grid, TextField, Box, Typography, Select, MenuItem,
  FormControl, InputLabel, LinearProgress,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { SKILL_LEVELS } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';

const EMPTY_SKILL = { name: '', level: 3, category: '' };

export default function SkillsSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { skills } = cvData;

  const handleChange = (id, field) => (e) => updateItem('skills', id, { [field]: e.target.value });

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('skills', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Compétences (${skills.length})`}
        onAdd={() => addItem('skills', EMPTY_SKILL)}
        addLabel="Ajouter une compétence"
      />

      {skills.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune compétence-cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="skills">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {skills.map((skill, idx) => (
                <Draggable key={skill.id} draggableId={skill.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={skill.name || 'Nouvelle compétence'}
                        subtitle={SKILL_LEVELS.find((l) => l.value === skill.level)?.label}
                        onDelete={() => removeItem('skills', skill.id)}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Compétence" value={skill.name} onChange={handleChange(skill.id, 'name')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Catégorie (optionnel)" placeholder="ex. Front-end" value={skill.category} onChange={handleChange(skill.id, 'category')} />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Niveau</InputLabel>
                              <Select value={skill.level} label="Niveau" onChange={handleChange(skill.id, 'level')}>
                                {SKILL_LEVELS.map((l) => (
                                  <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <LinearProgress
                              variant="determinate"
                              value={(skill.level / 5) * 100}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Grid>
                        </Grid>
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
