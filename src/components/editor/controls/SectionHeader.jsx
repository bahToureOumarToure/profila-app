import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function SectionHeader({ title, onAdd, addLabel = 'Ajouter' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      {onAdd && (
        <Button size="small" startIcon={<AddIcon />} onClick={onAdd} variant="outlined">
          {addLabel}
        </Button>
      )}
    </Box>
  );
}
