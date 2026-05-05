import { Grid, TextField, Box, Typography } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';

const EMPTY_CERT = { name: '', issuer: '', date: '', expiryDate: '', credentialId: '', url: '' };

export default function CertificationsSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { certifications } = cvData;

  const handleChange = (id, field) => (e) => updateItem('certifications', id, { [field]: e.target.value });

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('certifications', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Certifications (${certifications.length})`}
        onAdd={() => addItem('certifications', EMPTY_CERT)}
        addLabel="Ajouter une certification"
      />

      {certifications.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune certification — cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="certifications">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {certifications.map((cert, idx) => (
                <Draggable key={cert.id} draggableId={cert.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={cert.name || 'Nouvelle certification'}
                        subtitle={cert.issuer}
                        onDelete={() => removeItem('certifications', cert.id)}
                        defaultExpanded={certifications.length === 1}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Nom de la certification" value={cert.name} onChange={handleChange(cert.id, 'name')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Organisme délivreur" placeholder="ex. Université, FFF, AWS..." value={cert.issuer} onChange={handleChange(cert.id, 'issuer')} />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField fullWidth label="Date d'obtention" type="month" value={cert.date} onChange={handleChange(cert.id, 'date')} InputLabelProps={{ shrink: true }} />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField fullWidth label="Expiration (optionnel)" type="month" value={cert.expiryDate} onChange={handleChange(cert.id, 'expiryDate')} InputLabelProps={{ shrink: true }} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="N° / Identifiant (optionnel)" value={cert.credentialId} onChange={handleChange(cert.id, 'credentialId')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="URL (optionnel)" placeholder="https://..." value={cert.url} onChange={handleChange(cert.id, 'url')} />
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
