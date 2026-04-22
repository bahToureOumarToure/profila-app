import { useRef } from 'react';
import { Box, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useCV } from '@context/CVContext';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

const TEMPLATES = {
  modern:  ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
};

export default function CVPreview({ scale }) {
  const { cvData } = useCV();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const TemplateComponent = TEMPLATES[cvData.meta?.template] || ModernTemplate;

  // A4 dimensions in px at 96dpi: 794 × 1123
  const A4_WIDTH  = 794;

  // Auto-scale if not provided
  const containerRef = useRef(null);
  const effectiveScale = scale ?? (isMobile ? 0.45 : 0.7);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#e8eaf6',
        p: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, opacity: 0.7 }}>
        Aperçu A4 · {Math.round(effectiveScale * 100)}%
      </Typography>

      {/* A4 sheet */}
      <Paper
        elevation={4}
        sx={{
          width:     A4_WIDTH * effectiveScale,
          minHeight: 1123 * effectiveScale,
          transformOrigin: 'top center',
          overflow: 'hidden',
          flexShrink: 0,
          borderRadius: 0,
        }}
      >
        {/* Inner div at true A4 size, then scaled */}
        <Box
          sx={{
            width:     A4_WIDTH,
            minHeight: 1123,
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top left',
          }}
        >
          <TemplateComponent cvData={cvData} />
        </Box>
      </Paper>
    </Box>
  );
}
