import { useState } from 'react';
import {
  Card, CardContent, CardActions, Box, Typography,
  IconButton, Collapse, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export default function ItemCard({ title, subtitle, onDelete, children, defaultExpanded = false, dragHandleProps }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        {/* Drag handle */}
        <Box
          {...dragHandleProps}
          sx={{ px: 1, cursor: 'grab', color: 'text.disabled', display: 'flex', alignItems: 'center' }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>

        {/* Summary */}
        <Box
          sx={{ flexGrow: 1, py: 1.5, cursor: 'pointer', minWidth: 0 }}
          onClick={() => setExpanded(!expanded)}
        >
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {title || 'Nouveau'}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Tooltip title={expanded ? 'Réduire' : 'Développer'}>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <ExpandMoreIcon
              fontSize="small"
              sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <CardContent sx={{ pt: 0, pb: '12px !important' }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
}
