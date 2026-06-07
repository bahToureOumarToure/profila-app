import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
} from '@mui/material';
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

function suggestFileName(personalInfo) {
  const name = `${personalInfo.firstName ?? ''}-${personalInfo.lastName ?? ''}`
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return name.length > 1 ? `cv-${name}` : 'mon-cv';
}

function sanitizeFileName(raw) {
  return raw
    .trim()
    .replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 120);
}

export default function PDFDownloadButton({ variant = 'contained', size = 'medium', fullWidth = false }) {
  const { cvData } = useCV();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customName, setCustomName] = useState('');

  const openDialog = () => {
    setCustomName(suggestFileName(cvData.personalInfo));
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    const finalName = sanitizeFileName(customName) || 'mon-cv';
    setDialogOpen(false);
    setLoading(true);
    try {
      const PDFTemplate = TEMPLATE_MAP[cvData.meta?.template] || ModernPDFTemplate;
      const blob = await pdf(<PDFTemplate cvData={cvData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${finalName}.pdf`;
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
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={loading}
        onClick={openDialog}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
        color="secondary"
        sx={{ fontWeight: 600 }}
      >
        {loading ? 'Génération...' : 'Télécharger PDF'}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Nom du fichier PDF</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choisissez le nom sous lequel le CV sera enregistré. L&apos;extension
            <code style={{ marginLeft: 4 }}>.pdf</code> sera ajoutée automatiquement.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nom du fichier"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customName.trim()) {
                e.preventDefault();
                handleConfirm();
              }
            }}
            InputProps={{
              endAdornment: (
                <Box component="span" sx={{ color: 'text.secondary', fontSize: 14, ml: 1 }}>
                  .pdf
                </Box>
              ),
            }}
            helperText="Caractères interdits : \ / : * ? &quot; &lt; &gt; |"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="secondary"
            disabled={!customName.trim()}
            startIcon={<DownloadIcon />}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
