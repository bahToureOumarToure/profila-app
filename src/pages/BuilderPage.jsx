import { useState, useRef, lazy, Suspense } from 'react';
import {
  Box, Grid, Fab, Drawer, useTheme, useMediaQuery,
  Tooltip, Typography, Paper, Divider, Stack, Button, Snackbar, Alert,
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ImportPdfDialog = lazy(() => import('@components/ai/ImportPdfDialog'));
const JobCoachDialog = lazy(() => import('@components/ai/JobCoachDialog'));
import EditorPanel from '@components/editor/EditorPanel';
import CVPreview from '@components/preview/CVPreview';
import PDFDownloadButton from '@components/pdf/CVPDFDocument';
import SEOHead from '@components/common/SEOHead';
import { useCV } from '@context/CVContext';
import { downloadJSON, readJSONFile } from '@utils/cvHelpers';

export default function BuilderPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiImportOpen, setAiImportOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const jsonInputRef = useRef(null);
  const { cvData, loadCV, resetCV, saveCV } = useCV();

  const handleSave = () => { saveCV(); setSavedToast(true); };
  const handleExportJSON = () => downloadJSON(cvData, 'profila-cv.json');

  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      loadCV(data);
    } catch {
      alert('Fichier invalide. Veuillez importer un fichier JSON Profila.');
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Réinitialiser tout le CV ? Cette action est irréversible.')) {
      resetCV();
    }
  };

  return (
    <>
      <SEOHead title="Créer mon CV" canonical="/builder" />

      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top toolbar */}
        <Paper
          elevation={0}
          sx={{
            px: { xs: 2, md: 3 }, py: 1,
            borderBottom: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, gap: 1, flexWrap: 'wrap',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="primary">
            Éditeur CV
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Importer un CV PDF et le pré-remplir avec l'IA">
              <Button
                size="small" startIcon={<AutoAwesomeIcon />} variant="contained"
                onClick={() => setAiImportOpen(true)}
              >
                Importer PDF (IA)
              </Button>
            </Tooltip>

            <Tooltip title="Analyser la compatibilité avec une offre puis optimiser ton CV">
              <Button
                size="small" startIcon={<GpsFixedIcon />} variant="outlined"
                onClick={() => setCoachOpen(true)}
              >
                Coach IA (offre)
              </Button>
            </Tooltip>

            <Tooltip title="Enregistrer dans ce navigateur">
              <Button size="small" startIcon={<CloudDoneOutlinedIcon />} onClick={handleSave} variant="outlined">
                Sauvegarder
              </Button>
            </Tooltip>

            <Divider orientation="vertical" flexItem />
            <PDFDownloadButton size="small" />

            <Tooltip title="Plus d'actions">
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={() => { handleExportJSON(); setMenuAnchor(null); }}>
                <ListItemIcon><SaveAltIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Exporter en JSON</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { jsonInputRef.current?.click(); setMenuAnchor(null); }}>
                <ListItemIcon><UploadFileOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Importer un JSON</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleReset(); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
                <ListItemIcon><RestartAltIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Réinitialiser le CV</ListItemText>
              </MenuItem>
            </Menu>
            <input ref={jsonInputRef} type="file" accept=".json" hidden onChange={handleImportJSON} />
          </Stack>
        </Paper>

        {/* Main content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {isMobile ? (
            /* Mobile: editor only, preview via Drawer */
            <>
              <Box sx={{ height: '100%', overflow: 'hidden' }}>
                <EditorPanel />
              </Box>

              {/* FAB preview toggle */}
              <Fab
                color="primary"
                sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}
                onClick={() => setPreviewOpen(true)}
              >
                <VisibilityOutlinedIcon />
              </Fab>

              <Drawer
                anchor="bottom"
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                PaperProps={{ sx: { height: '90vh', borderRadius: '16px 16px 0 0', overflow: 'hidden' } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Aperçu du CV</Typography>
                  <Stack direction="row" spacing={1}>
                    <PDFDownloadButton size="small" />
                    <Tooltip title="Fermer">
                      <Button size="small" onClick={() => setPreviewOpen(false)} startIcon={<VisibilityOffOutlinedIcon />}>
                        Fermer
                      </Button>
                    </Tooltip>
                  </Stack>
                </Box>
                <Divider />
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <CVPreview scale={0.42} />
                </Box>
              </Drawer>
            </>
          ) : (
            /* Desktop: 2-column split */
            <Grid container sx={{ height: '100%' }}>
              <Grid item md={5} lg={4.5} sx={{ height: '100%', p: 1.5, overflowY: 'auto' }}>
                <EditorPanel />
              </Grid>
              <Grid item md={7} lg={7.5} sx={{ height: '100%', backgroundColor: '#e8eaf6', overflow: 'hidden' }}>
                <CVPreview />
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      {aiImportOpen && (
        <Suspense fallback={null}>
          <ImportPdfDialog open={aiImportOpen} onClose={() => setAiImportOpen(false)} />
        </Suspense>
      )}

      {coachOpen && (
        <Suspense fallback={null}>
          <JobCoachDialog open={coachOpen} onClose={() => setCoachOpen(false)} />
        </Suspense>
      )}

      <Snackbar
        open={savedToast}
        autoHideDuration={2500}
        onClose={() => setSavedToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSavedToast(false)} sx={{ width: '100%' }}>
          CV sauvegardé dans ce navigateur ✓
        </Alert>
      </Snackbar>
    </>
  );
}
