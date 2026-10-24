import { Grid, TextField, Box, Typography } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { EMPTY_ITEMS } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';
import DateField from '../controls/DateField';

const EMPTY_EDU = EMPTY_ITEMS.education;

export default function EducationSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { education } = cvData;

  const handleChange = (id, field) => (e) => updateItem('education', id, { [field]: e.target.value });

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('education', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Formation (${education.length})`}
        onAdd={() => addItem('education', EMPTY_EDU)}
        addLabel="Ajouter une formation"
      />

      {education.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune formation-cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="education">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {education.map((edu, idx) => (
                <Draggable key={edu.id} draggableId={edu.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={edu.degree || 'Nouveau diplôme'}
                        subtitle={edu.school}
                        onDelete={() => removeItem('education', edu.id)}
                        defaultExpanded={education.length === 1}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Établissement" value={edu.school} onChange={handleChange(edu.id, 'school')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Diplôme / Titre" value={edu.degree} onChange={handleChange(edu.id, 'degree')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Spécialité" placeholder="ex. Génie informatique" value={edu.field} onChange={handleChange(edu.id, 'field')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Ville, pays" placeholder="ex. Berkane, Maroc" value={edu.location} onChange={handleChange(edu.id, 'location')} />
                          </Grid>
                          <Grid item xs={6}>
                            <DateField label="Début" value={edu.startDate} onChange={handleChange(edu.id, 'startDate')} />
                          </Grid>
                          <Grid item xs={6}>
                            <DateField label="Fin (prévue)" value={edu.endDate} onChange={handleChange(edu.id, 'endDate')} />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField fullWidth multiline minRows={2} label="Détails (optionnel, une ligne par point)" placeholder="- Mention Bien · Cours : systèmes distribués, sécurité" value={edu.description} onChange={handleChange(edu.id, 'description')} />
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
