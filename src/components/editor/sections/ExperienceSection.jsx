import { Grid, TextField, FormControlLabel, Checkbox, Box, Typography } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { EMPTY_ITEMS } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';
import DateField from '../controls/DateField';

const EMPTY_EXP = EMPTY_ITEMS.experiences;

export default function ExperienceSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { experiences } = cvData;

  const handleChange = (id, field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateItem('experiences', id, { [field]: value });
  };

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('experiences', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Expériences professionnelles (${experiences.length})`}
        onAdd={() => addItem('experiences', EMPTY_EXP)}
        addLabel="Ajouter une expérience"
      />

      {experiences.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune expérience-cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="experiences">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {experiences.map((exp, idx) => (
                <Draggable key={exp.id} draggableId={exp.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={exp.position || 'Nouveau poste'}
                        subtitle={exp.company}
                        onDelete={() => removeItem('experiences', exp.id)}
                        defaultExpanded={experiences.length === 1}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Poste" value={exp.position} onChange={handleChange(exp.id, 'position')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Entreprise" value={exp.company} onChange={handleChange(exp.id, 'company')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Localisation" value={exp.location} onChange={handleChange(exp.id, 'location')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DateField label="Début" value={exp.startDate} onChange={handleChange(exp.id, 'startDate')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DateField label="Fin" value={exp.endDate} onChange={handleChange(exp.id, 'endDate')} disabled={exp.current} />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Checkbox checked={exp.current} onChange={handleChange(exp.id, 'current')} size="small" />}
                              label={<Typography variant="body2">Poste actuel</Typography>}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth multiline minRows={4}
                              label="Réalisations (une par ligne → puces)"
                              placeholder={'- Conçu une API REST sécurisée (JWT) utilisée par 3 équipes\n- Automatisé le déploiement avec Docker et GitHub Actions'}
                              value={exp.description}
                              onChange={handleChange(exp.id, 'description')}
                              helperText="Commencez par un verbe d'action, chiffrez les résultats, **gras** pour un mot-clé."
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth label="Stack technique / outils"
                              placeholder="Java, Spring Boot, Docker, Git"
                              value={exp.technologies} onChange={handleChange(exp.id, 'technologies')}
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
