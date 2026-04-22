import { Grid, TextField, Box, Typography } from '@mui/material';
import { useCV } from '@context/CVContext';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';

const EMPTY_PROJECT = { name: '', description: '', url: '', technologies: '' };

export default function ProjectsSection() {
  const { cvData, addItem, updateItem, removeItem } = useCV();
  const { projects } = cvData;

  const handleChange = (id, field) => (e) => updateItem('projects', id, { [field]: e.target.value });

  return (
    <Box>
      <SectionHeader
        title={`Projets (${projects.length})`}
        onAdd={() => addItem('projects', EMPTY_PROJECT)}
        addLabel="Ajouter un projet"
      />
      {projects.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          Aucun projet-cliquez sur "Ajouter" pour commencer.
        </Typography>
      )}
      {projects.map((proj) => (
        <ItemCard
          key={proj.id}
          title={proj.name || 'Nouveau projet'}
          subtitle={proj.technologies}
          onDelete={() => removeItem('projects', proj.id)}
          dragHandleProps={{}}
        >
          <Grid container spacing={2} mt={0}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nom du projet" value={proj.name} onChange={handleChange(proj.id, 'name')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Technologies" placeholder="React, Node.js, PostgreSQL..." value={proj.technologies} onChange={handleChange(proj.id, 'technologies')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="URL / Lien" placeholder="https://..." value={proj.url} onChange={handleChange(proj.id, 'url')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Description" value={proj.description} onChange={handleChange(proj.id, 'description')} />
            </Grid>
          </Grid>
        </ItemCard>
      ))}
    </Box>
  );
}
