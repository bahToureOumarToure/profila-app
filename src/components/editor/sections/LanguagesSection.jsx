import { Grid, TextField, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useCV } from '@context/CVContext';
import { LANGUAGE_LEVELS } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';

const EMPTY_LANG = { name: '', level: 'Courant (C1/C2)' };

export default function LanguagesSection() {
  const { cvData, addItem, updateItem, removeItem } = useCV();
  const { languages } = cvData;

  const handleChange = (id, field) => (e) => updateItem('languages', id, { [field]: e.target.value });

  return (
    <Box>
      <SectionHeader
        title={`Langues (${languages.length})`}
        onAdd={() => addItem('languages', EMPTY_LANG)}
        addLabel="Ajouter une langue"
      />
      {languages.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucune langue-cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}
      {languages.map((lang) => (
        <ItemCard
          key={lang.id}
          title={lang.name || 'Nouvelle langue'}
          subtitle={lang.level}
          onDelete={() => removeItem('languages', lang.id)}
          dragHandleProps={{}}
        >
          <Grid container spacing={2} mt={0}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Langue" value={lang.name} onChange={handleChange(lang.id, 'name')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Niveau</InputLabel>
                <Select value={lang.level} label="Niveau" onChange={handleChange(lang.id, 'level')}>
                  {LANGUAGE_LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </ItemCard>
      ))}
    </Box>
  );
}
