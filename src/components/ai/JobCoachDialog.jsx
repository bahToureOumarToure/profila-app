import { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  LinearProgress, Alert, TextField, Stack, Chip, IconButton, Divider,
  Paper, Switch, FormControlLabel, Step, Stepper, StepLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useCV } from '@context/CVContext';
import { auditCvAgainstJob, cvHasContent } from '@ai/auditJob';
import { optimizeCvForJob } from '@ai/optimizeCV';
import { hasApiKey } from '@ai/geminiClient';

const scoreColor = (s) => (s >= 75 ? 'success' : s >= 50 ? 'warning' : 'error');

function ScoreRing({ score }) {
  const color = scoreColor(score);
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 116, height: 116, borderRadius: '50%',
          background: (t) => `conic-gradient(${t.palette[color].main} ${score * 3.6}deg, ${t.palette.divider} 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto',
        }}
      >
        <Box sx={{ width: 90, height: 90, borderRadius: '50%', bgcolor: 'background.paper',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h4" fontWeight={800} color={`${color}.main`} lineHeight={1}>{score}</Typography>
          <Typography variant="caption" color="text.secondary">/ 100</Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Compatibilité ATS</Typography>
    </Box>
  );
}

function BreakdownBar({ label, value }) {
  return (
    <Box sx={{ mb: 0.8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" fontWeight={600}>{value}%</Typography>
      </Box>
      <LinearProgress variant="determinate" value={value} color={scoreColor(value)} />
    </Box>
  );
}

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
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>💡 {suggestion.rationale}</Typography>
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
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'success.dark' : '#e8f5e9') }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{suggestion.after}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

const STEPS = ['Offre', 'Audit', 'Optimisation'];
const STEP_INDEX = { input: 0, auditing: 0, audit: 1, optimizing: 1, review: 2, done: 2 };

export default function JobCoachDialog({ open, onClose }) {
  const { cvData, updatePersonalInfo, updateItem, addItem } = useCV();
  const [phase, setPhase] = useState('input');
  const [error, setError] = useState('');
  const [jobText, setJobText] = useState('');
  const [audit, setAudit] = useState(null);   // { job, audit }
  const [suggestions, setSuggestions] = useState([]);
  const [accepted, setAccepted] = useState({});
  const [appliedCount, setAppliedCount] = useState(0);
  const keyMissing = !hasApiKey();

  const handleClose = () => { if (!['auditing', 'optimizing'].includes(phase)) onClose(); };

  const runAudit = useCallback(async () => {
    setError(''); setPhase('auditing');
    try {
      const res = await auditCvAgainstJob(cvData, jobText);
      setAudit(res); setPhase('audit');
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.'); setPhase('input');
    }
  }, [cvData, jobText]);

  const runOptimize = useCallback(async () => {
    setError(''); setPhase('optimizing');
    try {
      const res = await optimizeCvForJob(cvData, jobText);
      setSuggestions(res);
      setAccepted(Object.fromEntries(res.map((s) => [s.id, true])));
      setPhase('review');
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.'); setPhase('audit');
    }
  }, [cvData, jobText]);

  const apply = () => {
    let n = 0;
    suggestions.forEach((s) => {
      if (!accepted[s.id]) return;
      if (s.target === 'summary') updatePersonalInfo({ summary: s.after });
      else if (s.target === 'experience') updateItem('experiences', s.expId, { description: s.after });
      else if (s.target === 'skillAdd') addItem('skills', { name: s.skillName, category: s.skillCategory, level: 4 });
      n += 1;
    });
    setAppliedCount(n); setPhase('done');
  };

  const a = audit?.audit;
  const j = audit?.job;
  const acceptedCount = suggestions.filter((s) => accepted[s.id]).length;
  const busy = phase === 'auditing' || phase === 'optimizing';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <GpsFixedIcon color="primary" fontSize="small" />
        Coach IA — Cibler & optimiser pour une offre
        <IconButton onClick={handleClose} disabled={busy} sx={{ ml: 'auto' }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 1 }}>
        <Stepper activeStep={STEP_INDEX[phase]} alternativeLabel>
          {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </Box>

      <DialogContent dividers>
        {/* STEP 1 — paste offer */}
        {phase === 'input' && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Colle une offre d'emploi : l'IA évalue la compatibilité de ton CV (score 0-100),
              puis te propose des optimisations à valider.
            </Typography>
            {!cvHasContent(cvData) && (
              <Alert severity="warning">Remplis ou importe d'abord ton CV pour un résultat pertinent.</Alert>
            )}
            {keyMissing && (
              <Alert severity="warning">
                Clé API Gemini non configurée. Définis <strong>VITE_GEMINI_API_KEY</strong> dans
                ton fichier <code>.env</code> (puis rebuild).
              </Alert>
            )}
            <TextField fullWidth multiline minRows={7} maxRows={15}
              label="Texte de l'offre d'emploi"
              placeholder="Colle ici la description du poste, les compétences requises…"
              value={jobText} onChange={(e) => setJobText(e.target.value)} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}

        {busy && (
          <Box sx={{ py: 3 }}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {phase === 'auditing' ? "Analyse de l'offre et audit…" : 'Génération des optimisations…'}
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* STEP 2 — audit results */}
        {phase === 'audit' && a && (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <ScoreRing score={a.score} />
              <Box sx={{ flex: 1, minWidth: 200 }}>
                {(j.title || j.company) && (
                  <Typography variant="subtitle1" fontWeight={700}>
                    {j.title}{j.company ? ` · ${j.company}` : ''}
                  </Typography>
                )}
                {j.seniority && <Typography variant="caption" color="text.secondary">Niveau visé : {j.seniority}</Typography>}
                <Box sx={{ mt: 1 }}>
                  <BreakdownBar label="Hard skills" value={a.breakdown.hardSkills} />
                  <BreakdownBar label="Soft skills" value={a.breakdown.softSkills} />
                  <BreakdownBar label="Mots-clés" value={a.breakdown.keywords} />
                  <BreakdownBar label="Séniorité" value={a.breakdown.seniority} />
                </Box>
              </Box>
            </Box>

            {a.matched.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" /> Déjà présent ({a.matched.length})
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {a.matched.map((m) => <Chip key={m} size="small" color="success" variant="outlined" label={m} />)}
                </Stack>
              </Box>
            )}

            {a.missing.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <ErrorOutlineIcon color="error" fontSize="small" /> Manquant ({a.missing.length})
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {a.missing.map((m) => <Chip key={m.keyword} size="small" color="error" variant="outlined" label={m.keyword} />)}
                </Stack>
              </Box>
            )}

            {a.reformulate.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <EditNoteIcon color="warning" fontSize="small" /> À reformuler ({a.reformulate.length})
                </Typography>
                <Stack spacing={0.5}>
                  {a.reformulate.map((r, i) => (
                    <Typography key={i} variant="body2"><strong>{r.keyword}</strong>{r.suggestion ? ` — ${r.suggestion}` : ''}</Typography>
                  ))}
                </Stack>
              </Box>
            )}

            {a.recommendations.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <LightbulbOutlinedIcon color="primary" fontSize="small" /> Recommandations
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {a.recommendations.map((r, i) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                  </Box>
                </Box>
              </>
            )}

            {error && <Alert severity="error">{error}</Alert>}
            <Alert severity="info" icon={<AutoFixHighIcon />}>
              Lance l'optimisation : l'IA réécrit ton résumé et tes expériences pour intégrer les
              mots-clés pertinents — sans rien inventer. Tu valideras chaque changement.
            </Alert>
          </Stack>
        )}

        {/* STEP 3 — optimization diffs */}
        {phase === 'review' && (
          <Stack spacing={1.5}>
            {suggestions.length === 0 ? (
              <Alert severity="info">
                Aucune réécriture proposée : ton CV est déjà bien aligné, ou il manque de contenu à optimiser.
              </Alert>
            ) : (
              <>
                <Alert severity="info">
                  {suggestions.length} suggestion(s). Décoche celles que tu ne veux pas, puis applique.
                  Rien n'est modifié tant que tu ne cliques pas « Appliquer ».
                </Alert>
                {suggestions.map((s) => (
                  <DiffCard key={s.id} suggestion={s} accepted={!!accepted[s.id]}
                    onToggle={() => setAccepted((prev) => ({ ...prev, [s.id]: !prev[s.id] }))} />
                ))}
              </>
            )}
          </Stack>
        )}

        {phase === 'done' && (
          <Alert icon={<CheckCircleOutlineIcon />} severity="success">
            {appliedCount} suggestion(s) appliquée(s). Vérifie l'aperçu et télécharge le PDF mis à jour.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {phase === 'input' && (
          <>
            <Button onClick={handleClose}>Fermer</Button>
            <Button variant="contained" onClick={runAudit}
              disabled={jobText.trim().length < 30 || keyMissing}>
              Analyser
            </Button>
          </>
        )}
        {phase === 'audit' && (
          <>
            <Button onClick={() => setPhase('input')}>Modifier l'offre</Button>
            <Button variant="contained" startIcon={<AutoFixHighIcon />} onClick={runOptimize}>
              Optimiser mon CV
            </Button>
          </>
        )}
        {phase === 'review' && (
          <>
            <Button onClick={() => setPhase('audit')}>Retour</Button>
            <Button variant="contained" onClick={apply} disabled={acceptedCount === 0}>
              Appliquer ({acceptedCount})
            </Button>
          </>
        )}
        {phase === 'done' && <Button variant="contained" onClick={handleClose}>Terminé</Button>}
        {busy && <Button disabled>Veuillez patienter…</Button>}
      </DialogActions>
    </Dialog>
  );
}
