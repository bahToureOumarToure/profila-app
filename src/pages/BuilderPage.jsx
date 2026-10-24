import { useState, useRef, lazy, Suspense } from 'react';
import {
  Box, Grid, Fab, Drawer, useTheme, useMediaQuery,
  Tooltip, Typography, Paper, Divider, Stack, Button, Snackbar, Alert,
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText, ToggleButtonGroup, ToggleButton, CircularProgress,
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
import UndoIcon from '@mui/icons-material/Undo';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

const ImportPdfDialog = lazy(() => import('@components/ai/ImportPdfDialog'));
const JobCoachDialog = lazy(() => import('@components/ai/JobCoachDialog'));
const CVAssistantPanel = lazy(() => import('@components/ai/CVAssistantPanel'));
const CVPreview = lazy(() => import('@components/preview/CVPreview'));
import EditorPanel from '@components/editor/EditorPanel';
import ATSPanel from '@components/editor/ATSPanel';
import PDFDownloadButton from '@components/pdf/CVPDFDocument';
import SEOHead from '@components/common/SEOHead';
import { useCV } from '@context/CVContext';
import { downloadJSON, readJSONFile } from '@utils/cvHelpers';
import sampleCV from '@data/sampleCV';

const Loader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
    <CircularProgress size={28} />
  </Box>
);

export default function BuilderPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiImportOpen, setAiImportOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  // Colonne de gauche : éditeur de sections, dialogue avec l'assistant, ou analyse ATS.
  const [leftMode, setLeftMode] = useState('edit');
  const [activeSection, setActiveSection] = useState('personal');
  const jsonInputRef = useRef(null);
  const { cvData, loadCV, resetCV, saveCV, undo, canUndo, lastChangeLabel } = useCV();

  const handleSave = () => { saveCV(); setSavedToast(true); };
  const handleExportJSON = () => downloadJSON(cvData, 'profila-cv.json');

  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJSONFile(file);
      loadCV(data, 'Import JSON');
    } catch {
      alert('Fichier invalide. Veuillez importer un fichier JSON Profila.');
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Réinitialiser tout le CV ? (vous pourrez annuler cette action)')) {
      resetCV();
    }
  };

  const handleLoadSample = () => {
    if (window.confirm("Remplacer le CV actuel par un exemple ? (vous pourrez annuler cette action)")) {
      loadCV(sampleCV, "Chargement de l'exemple");
    }
  };

  const goToSection = (tab) => { setActiveSection(tab); setLeftMode('edit'); };

  const leftPanel = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <ToggleButtonGroup
        exclusive fullWidth size="small" value={leftMode}
        onChange={(_, v) => v && setLeftMode(v)}
        sx={{ flexShrink: 0, '& .MuiToggleButton-root': { gap: 0.75, textTransform: 'none', fontWeight: 600 } }}
      >
        <ToggleButton value="edit"><EditNoteIcon fontSize="small" />Éditer</ToggleButton>
        <ToggleButton value="chat"><ForumOutlinedIcon fontSize="small" />Assistant IA</ToggleButton>
        <ToggleButton value="ats"><FactCheckOutlinedIcon fontSize="small" />Analyse ATS</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {leftMode === 'edit' && (
          <EditorPanel activeSection={activeSection} onSectionChange={setActiveSection} onOpenATS={() => setLeftMode('ats')} />
        )}
        {leftMode === 'chat' && <Suspense fallback={<Loader />}><CVAssistantPanel /></Suspense>}
        {leftMode === 'ats' && <ATSPanel onNavigate={goToSection} />}
      </Box>
    </Box>
  );

  return (
    <>
      <SEOHead title="Créer mon CV" canonical="/builder" />

      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top toolbar */}
        <Paper
          elevation={0}
          sx={{
            px: { xs: 1.5, md: 3 }, py: 1,
            borderBottom: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, gap: 1, flexWrap: 'wrap',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Éditeur CV
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Tooltip title="Importer un CV PDF et le pré-remplir avec l'IA">
              <Button size="small" startIcon={<AutoAwesomeIcon />} variant="contained" onClick={() => setAiImportOpen(true)}>
                Importer PDF
              </Button>
            </Tooltip>

            <Tooltip title="Score de compatibilité avec une offre puis optimisation guidée">
              <Button size="small" startIcon={<GpsFixedIcon />} variant="outlined" onClick={() => setCoachOpen(true)}>
                Coach offre
              </Button>
            </Tooltip>

            {canUndo && (
              <Tooltip title={`Annuler : ${lastChangeLabel}`}>
                <Button size="small" startIcon={<UndoIcon />} onClick={undo} variant="outlined" color="inherit">
                  Annuler
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Enregistrer dans ce navigateur">
              <Button size="small" startIcon={<CloudDoneOutlinedIcon />} onClick={handleSave} variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                Sauvegarder
              </Button>
            </Tooltip>

            <Divider orientation="vertical" flexItem />
            <PDFDownloadButton size="small" />

            <Tooltip title="Plus d'actions">
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Plus d'actions">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={() => { handleLoadSample(); setMenuAnchor(null); }}>
                <ListItemIcon><ArticleOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Charger un CV exemple</ListItemText>
              </MenuItem>
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
            /* Mobile: panneau de gauche seul, aperçu via Drawer */
            <>
              <Box sx={{ height: '100%', overflow: 'hidden', p: 1 }}>
                {leftPanel}
              </Box>

              <Fab
                color="primary"
                aria-label="Aperçu du CV"
                sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}
                onClick={() => setPreviewOpen(true)}
              >
                <VisibilityOutlinedIcon />
              </Fab>

              <Drawer
                anchor="bottom"
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                PaperProps={{ sx: { height: '92vh', borderRadius: '16px 16px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Aperçu du CV</Typography>
                  <Stack direction="row" spacing={1}>
                    <PDFDownloadButton size="small" />
                    <Button size="small" onClick={() => setPreviewOpen(false)} startIcon={<VisibilityOffOutlinedIcon />}>
                      Fermer
                    </Button>
                  </Stack>
                </Box>
                <Divider />
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  {previewOpen && <Suspense fallback={<Loader />}><CVPreview /></Suspense>}
                </Box>
              </Drawer>
            </>
          ) : (
            /* Desktop: 2-column split */
            <Grid container sx={{ height: '100%' }}>
              <Grid item md={5} lg={4.5} sx={{ height: '100%', p: 1.5 }}>
                {leftPanel}
              </Grid>
              <Grid item md={7} lg={7.5} sx={{ height: '100%', overflow: 'hidden' }}>
                <Suspense fallback={<Loader />}><CVPreview /></Suspense>
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
