import {
  Grid, TextField, Box, Typography, Select, MenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { INTEREST_CATEGORIES } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';

const EMPTY_INTEREST = { name: '', category: 'Sport', description: '' };

export default function InterestsSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { interests } = cvData;

  const handleChange = (id, field) => (e) => updateItem('interests', id, { [field]: e.target.value });

  const onDragEnd = ({ source, destination }) => {
    if (destination) reorderItems('interests', source.index, destination.index);
  };

  return (
    <Box>
      <SectionHeader
        title={`Centres d'intérêt (${interests.length})`}
        onAdd={() => addItem('interests', EMPTY_INTEREST)}
        addLabel="Ajouter un centre d'intérêt"
      />

      {interests.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucun centre d'intérêt — cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="interests">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {interests.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(drag) => (
                    <Box ref={drag.innerRef} {...drag.draggableProps}>
                      <ItemCard
                        title={item.name || 'Nouveau centre d\'intérêt'}
                        subtitle={item.category}
                        onDelete={() => removeItem('interests', item.id)}
                        dragHandleProps={drag.dragHandleProps}
                      >
                        <Grid container spacing={2} mt={0}>
                          <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Intitulé" placeholder="ex. Football, Lecture..." value={item.name} onChange={handleChange(item.id, 'name')} />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Catégorie</InputLabel>
                              <Select value={item.category} label="Catégorie" onChange={handleChange(item.id, 'category')}>
                                {INTEREST_CATEGORIES.map((c) => (
                                  <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
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
