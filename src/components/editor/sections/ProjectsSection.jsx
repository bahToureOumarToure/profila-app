import { Grid, TextField, Box, Typography } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { EMPTY_ITEMS } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';
import DateField from '../controls/DateField';

export default function ProjectsSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { projects } = cvData;

  const handleChange = (id, field) => (e) => updateItem('projects', id, { [field]: e.target.value });

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('projects', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Projets (${projects.length})`}
        onAdd={() => addItem('projects', EMPTY_ITEMS.projects)}
        addLabel="Ajouter un projet"
      />
      {projects.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucun projet-cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="projects">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {projects.map((proj, idx) => (
                <Draggable key={proj.id} draggableId={proj.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={proj.name || 'Nouveau projet'}
                        subtitle={proj.technologies}
                        onDelete={() => removeItem('projects', proj.id)}
                        defaultExpanded={projects.length === 1}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12}>
                            <TextField fullWidth label="Nom du projet" placeholder="ex. WorkForceX – Gestion des collaborateurs" value={proj.name} onChange={handleChange(proj.id, 'name')} />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField fullWidth label="Technologies" placeholder="Java, Spring Boot, Docker…" value={proj.technologies} onChange={handleChange(proj.id, 'technologies')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DateField label="Début" value={proj.startDate} onChange={handleChange(proj.id, 'startDate')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DateField label="Fin" value={proj.endDate} onChange={handleChange(proj.id, 'endDate')} />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField fullWidth label="Lien (GitHub, démo)" placeholder="https://github.com/..." value={proj.url} onChange={handleChange(proj.id, 'url')} helperText="Le nom du projet devient cliquable dans le PDF." />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth multiline minRows={3} label="Réalisations (une par ligne → puces)"
                              placeholder={'- Conçu une architecture microservices avec Spring Cloud\n- Sécurisé les API via OAuth2 / JWT'}
                              value={proj.description} onChange={handleChange(proj.id, 'description')}
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
