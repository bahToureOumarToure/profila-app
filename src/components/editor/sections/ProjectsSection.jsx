import { Grid, TextField, Box, Typography, MenuItem, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCV } from '@context/CVContext';
import { EMPTY_ITEMS, PROJECT_TYPES } from '@data/initialCVData';
import ItemCard from '../controls/ItemCard';
import SectionHeader from '../controls/SectionHeader';
import DateField from '../controls/DateField';

// Une seule liste de projets, affichée (et imprimée) en deux groupes selon le type.
const GROUPS = [
  {
    type: 'Académique',
    title: 'Projets académiques',
    addLabel: 'Ajouter un projet académique',
    empty: 'PFA, PFE, projets de modules : réalisés dans le cadre de vos études.',
    contextPlaceholder: 'ex. PFA – ENIAD, Module Génie logiciel',
  },
  {
    type: 'Personnel',
    title: 'Projets personnels',
    addLabel: 'Ajouter un projet personnel',
    empty: 'Projets menés de votre propre initiative : side projects, open source, hackathons…',
    contextPlaceholder: 'ex. Open source, Hackathon, Freelance',
  },
];

function ProjectCard({ proj, group, drag, onChange, onDelete, expanded }) {
  const handleChange = (field) => (e) => onChange({ [field]: e.target.value });
  return (
    <ItemCard
      title={proj.name || 'Nouveau projet'}
      subtitle={[proj.context, proj.technologies].filter(Boolean).join(' · ')}
      onDelete={onDelete}
      defaultExpanded={expanded}
      dragHandleProps={drag.dragHandleProps}
    >
      <Grid container spacing={2} mt={0}>
        <Grid item xs={12} sm={8}>
          <TextField fullWidth label="Nom du projet" placeholder="ex. WorkForceX – Gestion des collaborateurs" value={proj.name} onChange={handleChange('name')} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField select fullWidth size="small" label="Type" value={proj.type} onChange={handleChange('type')}>
            {PROJECT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Cadre (facultatif)" placeholder={group.contextPlaceholder}
            value={proj.context} onChange={handleChange('context')}
            helperText="Affiché entre parenthèses après le nom du projet."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Stack technique / outils" placeholder="Java, Spring Boot, Docker, Git"
            value={proj.technologies} onChange={handleChange('technologies')}
            helperText="Imprimée sous le projet, comme pour les expériences."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DateField label="Début" value={proj.startDate} onChange={handleChange('startDate')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DateField label="Fin" value={proj.endDate} onChange={handleChange('endDate')} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Lien (GitHub, démo)" placeholder="https://github.com/..." value={proj.url} onChange={handleChange('url')} helperText="Le nom du projet devient cliquable dans le PDF." />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth multiline minRows={3} label="Réalisations (une par ligne → puces)"
            placeholder={'- Conçu une architecture microservices avec Spring Cloud\n- Sécurisé les API via OAuth2 / JWT'}
            value={proj.description} onChange={handleChange('description')}
          />
        </Grid>
      </Grid>
    </ItemCard>
  );
}

export default function ProjectsSection() {
  const { cvData, addItem, updateItem, removeItem, reorderItems } = useCV();
  const { projects } = cvData;
  const ofType = (type) => projects.filter((p) => (p.type === 'Personnel' ? 'Personnel' : 'Académique') === type);

  // Réordonnancement à l'intérieur d'un groupe : on convertit les positions du
  // groupe en positions dans la liste complète.
  const onDragEnd = ({ source, destination }) => {
    if (!destination || source.droppableId !== destination.droppableId) return;
    const group = ofType(source.droppableId);
    const from = projects.indexOf(group[source.index]);
    const to = projects.indexOf(group[destination.index]);
    if (from !== to) reorderItems('projects', from, to);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {GROUPS.map((group, gi) => {
        const list = ofType(group.type);
        return (
          <Box key={group.type} sx={{ mb: 2 }}>
            {gi > 0 && <Divider sx={{ mb: 2 }} />}
            <SectionHeader
              title={`${group.title} (${list.length})`}
              onAdd={() => addItem('projects', { ...EMPTY_ITEMS.projects, type: group.type })}
              addLabel={group.addLabel}
            />
            {list.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ pb: 2, textAlign: 'center' }}>
                {group.empty}
              </Typography>
            )}
            <Droppable droppableId={group.type}>
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {list.map((proj, idx) => (
                    <Draggable key={proj.id} draggableId={proj.id} index={idx}>
                      {(drag) => (
                        <Box ref={drag.innerRef} {...drag.draggableProps}>
                          <ProjectCard
                            proj={proj} group={group} drag={drag}
                            expanded={list.length === 1 || !proj.name}
                            onChange={(data) => updateItem('projects', proj.id, data)}
                            onDelete={() => removeItem('projects', proj.id)}
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        );
      })}
    </DragDropContext>
  );
}
