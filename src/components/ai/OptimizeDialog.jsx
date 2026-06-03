import { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  LinearProgress, Alert, TextField, Stack, Link, IconButton, Paper, Switch, FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useCV } from '@context/CVContext';
import { optimizeCvForJob } from '@ai/optimizeCV';
import { cvHasContent } from '@ai/auditJob';
import { hasApiKey, setApiKey } from '@ai/geminiClient';

function DiffCard({ suggestion, accepted, onToggle }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>{suggestion.label}</Typography>
        <FormControlLabel
          sx={{ m: 0 }}
          control={<Switch size="small" checked={accepted} onChange={onToggle} />}
          label={<Typography variant="caption">{accepted ? 'Accepté' : 'Ignoré'}</Typography>}
          labelPlacement="start"
        />
      </Box>

      {suggestion.rationale && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          💡 {suggestion.rationale}
        </Typography>
      )}

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">Avant</Typography>
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover', opacity: 0.8 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{suggestion.before || '—'}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" color="success.main">Après</Typography>
        <Box sx={{ p: 1, borderRadius: 1, border: '1px solid', borderColor: 'success.light',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'success.dark' : 'success.50') }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{suggestion.after}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function OptimizeDialog({ open, onClose }) {
  const { cvData, updatePersonalInfo, updateItem } = useCV();
  const [phase, setPhase] = useState('idle');     // idle | working | review | done | error
  const [error, setError] = useState('');
  const [jobText, setJobText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [accepted, setAccepted] = useState({});   // id -> bool
  const [appliedCount, setAppliedCount] = useState(0);
  const [keyInput, setKeyInput] = useState('');
  const needsKey = !hasApiKey();

  const handleClose = () => { if (phase !== 'working') onClose(); };

  const run = useCallback(async () => {
    setError(''); setPhase('working');
    try {
      if (needsKey && keyInput.trim()) setApiKey(keyInput);
      const res = await optimizeCvForJob(cvData, jobText);
      if (res.length === 0) {
        setError('Aucune amélioration proposée : ton CV est déjà bien aligné, ou il manque de contenu à optimiser.');
        setPhase('error');
        return;
      }
      setSuggestions(res);
      setAccepted(Object.fromEntries(res.map((s) => [s.id, true]))); // tout accepté par défaut
      setPhase('review');
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.'); setPhase('error');
    }
  }, [cvData, jobText, needsKey, keyInput]);

  const toggle = (id) => setAccepted((prev) => ({ ...prev, [id]: !prev[id] }));

  const apply = () => {
    let n = 0;
    suggestions.forEach((s) => {
      if (!accepted[s.id]) return;
      if (s.target === 'summary') updatePersonalInfo({ summary: s.after });
      else if (s.target === 'experience') updateItem('experiences', s.expId, { description: s.after });
      n += 1;
    });
    setAppliedCount(n);
    setPhase('done');
  };

  const acceptedCount = suggestions.filter((s) => accepted[s.id]).length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoFixHighIcon color="primary" fontSize="small" />
        Optimisation ATS
        <IconButton onClick={handleClose} disabled={phase === 'working'} sx={{ ml: 'auto' }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {(phase === 'idle' || phase === 'error') && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Colle une offre d'emploi : l'IA propose une réécriture de ton résumé et de tes
              expériences pour intégrer les mots-clés pertinents — <strong>sans rien inventer</strong>.
              Tu valides chaque suggestion avant qu'elle ne soit appliquée.
            </Typography>

            {!cvHasContent(cvData) && (
              <Alert severity="warning">Remplis ou importe d'abord ton CV pour l'optimiser.</Alert>
            )}

            {needsKey && (
              <Box>
                <TextField
                  fullWidth size="small" type="password" label="Clé API Gemini"
                  placeholder="AIza…" value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
                <Typography variant="caption" color="text.secondary">
                  Gratuite sur{' '}
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</Link>.
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth multiline minRows={6} maxRows={14}
              label="Texte de l'offre d'emploi"
              placeholder="Colle ici la description du poste…"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />

            {phase === 'error' && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}

        {phase === 'working' && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>Génération des optimisations…</Typography>
            <LinearProgress />
          </Box>
        )}

        {phase === 'review' && (
          <Stack spacing={1.5}>
            <Alert severity="info">
              {suggestions.length} suggestion(s). Décoche celles que tu ne veux pas, puis applique.
              Aucune modification n'est faite tant que tu ne cliques pas « Appliquer ».
            </Alert>
            {suggestions.map((s) => (
              <DiffCard key={s.id} suggestion={s} accepted={!!accepted[s.id]} onToggle={() => toggle(s.id)} />
            ))}
          </Stack>
        )}

        {phase === 'done' && (
          <Alert icon={<CheckCircleOutlineIcon />} severity="success">
            {appliedCount} suggestion(s) appliquée(s) à ton CV. Pense à vérifier le rendu et à
            télécharger le PDF mis à jour.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {phase === 'review' && (
          <>
            <Button onClick={() => setPhase('idle')}>Retour</Button>
            <Button variant="contained" onClick={apply} disabled={acceptedCount === 0}>
              Appliquer ({acceptedCount})
            </Button>
          </>
        )}
        {phase === 'done' && <Button variant="contained" onClick={handleClose}>Terminé</Button>}
        {(phase === 'idle' || phase === 'error' || phase === 'working') && (
          <>
            <Button onClick={handleClose} disabled={phase === 'working'}>Fermer</Button>
            <Button
              variant="contained" onClick={run}
              disabled={phase === 'working' || jobText.trim().length < 30 || (needsKey && !keyInput.trim())}
            >
              Proposer des optimisations
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
