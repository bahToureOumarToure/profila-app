import { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  LinearProgress, Alert, TextField, Stack, Chip, Link, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useCV } from '@context/CVContext';
import { parseResumeFromPdf } from '@ai/parseResume';
import { hasApiKey, setApiKey } from '@ai/geminiClient';
import { summarizeParsedCV } from '@ai/cvSchema';

const STEP_LABELS = {
  extract: 'Extraction du texte du PDF…',
  analyze: 'Analyse par l’IA (Gemini)…',
  structure: 'Structuration des données…',
};

export default function ImportPdfDialog({ open, onClose }) {
  const { loadCV } = useCV();
  const [phase, setPhase] = useState('idle');     // idle | working | review | error
  const [step, setStep] = useState('extract');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);     // { cv, meta }
  const [keyInput, setKeyInput] = useState('');
  const needsKey = !hasApiKey();

  const reset = useCallback(() => {
    setPhase('idle'); setStep('extract'); setError(''); setResult(null);
  }, []);

  const handleClose = () => { if (phase !== 'working') { reset(); onClose(); } };

  const runParse = useCallback(async (file) => {
    setError(''); setResult(null); setPhase('working'); setStep('extract');
    try {
      if (needsKey && keyInput.trim()) setApiKey(keyInput);
      const res = await parseResumeFromPdf(file, { onProgress: setStep });
      setResult(res); setPhase('review');
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.'); setPhase('error');
    }
  }, [needsKey, keyInput]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) runParse(file);
  };

  const handleApply = () => {
    if (!result) return;
    loadCV(result.cv);
    reset();
    onClose();
  };

  const summary = result ? summarizeParsedCV(result.cv) : null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" fontSize="small" />
        Importer un CV PDF avec l'IA
        <IconButton onClick={handleClose} disabled={phase === 'working'} sx={{ ml: 'auto' }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* ── Étape de saisie ───────────────────────────────────────────── */}
        {(phase === 'idle' || phase === 'error') && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Importe ton CV au format PDF : l'IA extrait tes informations et pré-remplit
              l'éditeur. Tu pourras tout vérifier et corriger ensuite.
            </Typography>

            {needsKey && (
              <Box>
                <TextField
                  fullWidth size="small" type="password" label="Clé API Gemini"
                  placeholder="AIza…" value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
                <Typography variant="caption" color="text.secondary">
                  Gratuite sur{' '}
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                    Google AI Studio
                  </Link>
                  . Stockée uniquement dans ton navigateur.
                </Typography>
              </Box>
            )}

            {phase === 'error' && <Alert severity="error">{error}</Alert>}

            <Button
              component="label" variant="contained" startIcon={<UploadFileOutlinedIcon />}
              disabled={needsKey && !keyInput.trim()}
            >
              Choisir un fichier PDF
              <input type="file" accept="application/pdf" hidden onChange={handleFile} />
            </Button>
          </Stack>
        )}

        {/* ── Traitement en cours ───────────────────────────────────────── */}
        {phase === 'working' && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>{STEP_LABELS[step]}</Typography>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
              L'extraction du texte est locale ; seul le texte est envoyé à Gemini.
            </Typography>
          </Box>
        )}

        {/* ── Validation ────────────────────────────────────────────────── */}
        {phase === 'review' && summary && (
          <Stack spacing={2}>
            <Alert icon={<CheckCircleOutlineIcon />} severity="success">
              CV analysé avec succès.
            </Alert>

            {result.meta.lowText && (
              <Alert severity="warning">
                Peu de texte détecté dans ce PDF (peut-être scanné/vectorisé) : vérifie
                attentivement les champs extraits.
              </Alert>
            )}

            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{summary.name}</Typography>
              {summary.title && (
                <Typography variant="body2" color="text.secondary">{summary.title}</Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={`${summary.counts.experiences} expérience(s)`} />
              <Chip size="small" label={`${summary.counts.education} formation(s)`} />
              <Chip size="small" label={`${summary.counts.skills} compétence(s)`} />
              <Chip size="small" label={`${summary.counts.languages} langue(s)`} />
              <Chip size="small" label={`${summary.counts.projects} projet(s)`} />
              <Chip size="small" label={`${summary.counts.certifications} certif.`} />
            </Stack>

            <Alert severity="info">
              Appliquer remplacera le contenu actuel de l'éditeur. Pense à sauvegarder ton
              CV en JSON avant si besoin.
            </Alert>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {phase === 'review' ? (
          <>
            <Button onClick={() => reset()}>Recommencer</Button>
            <Button variant="contained" onClick={handleApply}>Remplir l'éditeur</Button>
          </>
        ) : (
          <Button onClick={handleClose} disabled={phase === 'working'}>Fermer</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
