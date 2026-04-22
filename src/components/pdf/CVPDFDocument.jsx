import { lazy, Suspense } from 'react';
import { PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { Button, CircularProgress, Box } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { ModernPDFTemplate } from './templates/ModernPDFTemplate';
import { useCV } from '@context/CVContext';

const TEMPLATE_MAP = {
  modern:  ModernPDFTemplate,
  classic: ModernPDFTemplate, // Uses same structure, can be specialized later
  minimal: ModernPDFTemplate,
};

function getPDFFileName(personalInfo) {
  const name = `${personalInfo.firstName}-${personalInfo.lastName}`.replace(/\s+/g, '-').toLowerCase();
  return name.length > 1 ? `cv-${name}.pdf` : 'mon-cv.pdf';
}

export default function PDFDownloadButton({ variant = 'contained', size = 'medium', fullWidth = false }) {
  const { cvData } = useCV();
  const PDFTemplate = TEMPLATE_MAP[cvData.meta?.template] || ModernPDFTemplate;
  const fileName = getPDFFileName(cvData.personalInfo);

  return (
    <PDFDownloadLink
      document={<PDFTemplate cvData={cvData} />}
      fileName={fileName}
      style={{ textDecoration: 'none' }}
    >
      {({ loading, error }) => (
        <Button
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
          color="secondary"
          sx={{ fontWeight: 600 }}
        >
          {loading ? 'Génération...' : 'Télécharger PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
