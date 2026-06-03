import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { ModernPDFTemplate } from './templates/ModernPDFTemplate';
import { ClassicPDFTemplate } from './templates/ClassicPDFTemplate';
import { MinimalPDFTemplate } from './templates/MinimalPDFTemplate';
import { useCV } from '@context/CVContext';

const TEMPLATE_MAP = {
  modern:  ModernPDFTemplate,
  classic: ClassicPDFTemplate,
  minimal: MinimalPDFTemplate,
};

function getPDFFileName(personalInfo) {
  const name = `${personalInfo.firstName}-${personalInfo.lastName}`.replace(/\s+/g, '-').toLowerCase();
  return name.length > 1 ? `cv-${name}.pdf` : 'mon-cv.pdf';
}

export default function PDFDownloadButton({ variant = 'contained', size = 'medium', fullWidth = false }) {
  const { cvData } = useCV();
  const [loading, setLoading] = useState(false);

  // Génère le PDF au clic à partir des données ACTUELLES. Évite le bug de
  // PDFDownloadLink qui met en cache le document au montage (CV encore vide)
  // et ne le régénère pas après un loadCV (import PDF/JSON).
  const handleDownload = async () => {
    setLoading(true);
    try {
      const PDFTemplate = TEMPLATE_MAP[cvData.meta?.template] || ModernPDFTemplate;
      const blob = await pdf(<PDFTemplate cvData={cvData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getPDFFileName(cvData.personalInfo);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Erreur lors de la génération du PDF : ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={loading}
      onClick={handleDownload}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
      color="secondary"
      sx={{ fontWeight: 600 }}
    >
      {loading ? 'Génération...' : 'Télécharger PDF'}
    </Button>
  );
}
