import {
  Grid, TextField, Box, Typography, Select, MenuItem,
  FormControl, InputLabel, FormControlLabel, Checkbox,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { ACTIVITY_TYPES, EMPTY_ITEMS } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';
import DateField from '../controls/DateField';

// Activités parauniversitaires : associations, clubs, BDE, bénévolat…
export default function ActivitiesSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { activities } = cvData;

  const handleChange = (id, field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateItem('activities', id, { [field]: value });
  };

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('activities', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Activités parauniversitaires (${activities.length})`}
        onAdd={() => addItem('activities', EMPTY_ITEMS.activities)}
        addLabel="Ajouter une activité"
      />

      {activities.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune activité - ajoutez vos responsabilités associatives, clubs, BDE ou actions de bénévolat :
          elles montrent votre leadership et votre sens de l'équipe.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="activities">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {activities.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={item.role || item.organization || 'Nouvelle activité'}
                        subtitle={[item.role ? item.organization : '', item.type].filter(Boolean).join(' · ')}
                        onDelete={() => removeItem('activities', item.id)}
                        defaultExpanded={activities.length === 1 || (!item.role && !item.organization)}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12} sm={7}>
                            <TextField fullWidth label="Rôle" placeholder="ex. Président, Trésorier, Bénévole…" value={item.role} onChange={handleChange(item.id, 'role')} />
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select value={item.type} label="Type" onChange={handleChange(item.id, 'type')}>
                                {ACTIVITY_TYPES.map((t) => (
                                  <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <TextField fullWidth label="Association / club / organisation" placeholder="ex. Club Informatique de l'ENIAD" value={item.organization} onChange={handleChange(item.id, 'organization')} />
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <TextField fullWidth label="Ville (optionnel)" value={item.location} onChange={handleChange(item.id, 'location')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DateField label="Début" value={item.startDate} onChange={handleChange(item.id, 'startDate')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DateField label="Fin" value={item.endDate} onChange={handleChange(item.id, 'endDate')} disabled={item.current} />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Checkbox size="small" checked={Boolean(item.current)} onChange={handleChange(item.id, 'current')} />}
                              label={<Typography variant="body2">Engagement en cours</Typography>}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth multiline minRows={2}
                              label="Réalisations (optionnel, une par ligne → puces)"
                              placeholder={'- Organisé un hackathon de 120 participants\n- Géré un budget de 15 000 MAD'}
                              value={item.description} onChange={handleChange(item.id, 'description')}
                              helperText="Restez bref : une ligne suffit souvent. Chiffrez ce qui peut l'être."
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
