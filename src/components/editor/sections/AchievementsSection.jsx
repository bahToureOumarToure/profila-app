import {
  Grid, TextField, Box, Typography, Select, MenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { ACHIEVEMENT_TYPES } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';
import DateField from '../controls/DateField';

const EMPTY_ACHIEVEMENT = {
  title: '',
  type: 'Compétition',
  rank: '',
  competition: '',
  date: '',
  location: '',
  description: '',
};

export default function AchievementsSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { achievements } = cvData;

  const handleChange = (id, field) => (e) => updateItem('achievements', id, { [field]: e.target.value });

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('achievements', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Compétitions & palmarès (${achievements.length})`}
        onAdd={() => addItem('achievements', EMPTY_ACHIEVEMENT)}
        addLabel="Ajouter une compétition"
      />

      {achievements.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune entrée - ajoutez vos compétitions (ICPC, hackathons…), classements ou médailles.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="achievements">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {achievements.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={item.title || 'Nouvelle entrée'}
                        subtitle={[item.rank, item.competition].filter(Boolean).join(' · ')}
                        onDelete={() => removeItem('achievements', item.id)}
                        defaultExpanded={achievements.length === 1}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12} sm={8}>
                            <TextField fullWidth label="Titre / Intitulé" placeholder="ex. Champion régional 100 m" value={item.title} onChange={handleChange(item.id, 'title')} />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select value={item.type} label="Type" onChange={handleChange(item.id, 'type')}>
                                {ACHIEVEMENT_TYPES.map((t) => (
                                  <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Classement / Médaille" placeholder="ex. 1ère place, Or..." value={item.rank} onChange={handleChange(item.id, 'rank')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Compétition / Épreuve" placeholder="ex. Championnat de France" value={item.competition} onChange={handleChange(item.id, 'competition')} />
                          </Grid>
                          <Grid item xs={6}>
                            <DateField label="Date" value={item.date} onChange={handleChange(item.id, 'date')} />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField fullWidth label="Lieu" value={item.location} onChange={handleChange(item.id, 'location')} />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description (optionnel)" value={item.description} onChange={handleChange(item.id, 'description')} />
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
