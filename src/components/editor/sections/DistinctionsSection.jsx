import {
  Grid, TextField, Box, Typography, Select, MenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { DISTINCTION_TYPES } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';
import DateField from '../controls/DateField';

const EMPTY_DISTINCTION = {
  title: '',
  type: 'Distinction',
  issuer: '',
  date: '',
  url: '',
  description: '',
};

export default function DistinctionsSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { distinctions } = cvData;

  const handleChange = (id, field) => (e) => updateItem('distinctions', id, { [field]: e.target.value });

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('distinctions', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Distinctions & publications (${distinctions.length})`}
        onAdd={() => addItem('distinctions', EMPTY_DISTINCTION)}
        addLabel="Ajouter une distinction / publication"
      />

      {distinctions.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune entrée - ajoutez vos prix, publications ou conférences.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="distinctions">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {distinctions.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={item.title || 'Nouvelle entrée'}
                        subtitle={[item.type, item.issuer].filter(Boolean).join(' · ')}
                        onDelete={() => removeItem('distinctions', item.id)}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12} sm={8}>
                            <TextField fullWidth label="Titre" value={item.title} onChange={handleChange(item.id, 'title')} />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select value={item.type} label="Type" onChange={handleChange(item.id, 'type')}>
                                {DISTINCTION_TYPES.map((t) => (
                                  <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Organisme / Éditeur" value={item.issuer} onChange={handleChange(item.id, 'issuer')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <DateField label="Date" value={item.date} onChange={handleChange(item.id, 'date')} />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField fullWidth label="URL (optionnel)" placeholder="https://..." value={item.url} onChange={handleChange(item.id, 'url')} />
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
