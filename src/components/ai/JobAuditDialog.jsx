import { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  LinearProgress, Alert, TextField, Stack, Chip, Link, IconButton, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useCV } from '@context/CVContext';
import { auditCvAgainstJob, cvHasContent } from '@ai/auditJob';
import { hasApiKey, setApiKey } from '@ai/geminiClient';

function scoreColor(score) {
  if (score >= 75) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

function ScoreRing({ score }) {
  const color = scoreColor(score);
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Box
          sx={{
            width: 120, height: 120, borderRadius: '50%',
            background: (t) => `conic-gradient(${t.palette[color].main} ${score * 3.6}deg, ${t.palette.divider} 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Box sx={{ width: 92, height: 92, borderRadius: '50%', bgcolor: 'background.paper',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" fontWeight={800} color={`${color}.main`}>{score}</Typography>
            <Typography variant="caption" color="text.secondary">/ 100</Typography>
          </Box>
        </Box>
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>Compatibilité ATS</Typography>
    </Box>
  );
}

function BreakdownBar({ label, value }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" fontWeight={600}>{value}%</Typography>
      </Box>
      <LinearProgress variant="determinate" value={value} color={scoreColor(value)} />
    </Box>
  );
}

export default function JobAuditDialog({ open, onClose }) {
  const { cvData } = useCV();
  const [phase, setPhase] = useState('idle');   // idle | working | result | error
  const [error, setError] = useState('');
  const [jobText, setJobText] = useState('');
  const [result, setResult] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const needsKey = !hasApiKey();

  const handleClose = () => { if (phase !== 'working') onClose(); };

  const runAudit = useCallback(async () => {
    setError(''); setPhase('working');
    try {
      if (needsKey && keyInput.trim()) setApiKey(keyInput);
      const res = await auditCvAgainstJob(cvData, jobText);
      setResult(res); setPhase('result');
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.'); setPhase('error');
    }
  }, [cvData, jobText, needsKey, keyInput]);

  const a = result?.audit;
  const j = result?.job;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GpsFixedIcon color="primary" fontSize="small" />
        Cibler une offre — Audit de compatibilité
        <IconButton onClick={handleClose} disabled={phase === 'working'} sx={{ ml: 'auto' }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {(phase === 'idle' || phase === 'error') && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Colle le texte d'une offre d'emploi : l'IA en extrait les mots-clés et compare
              avec ton CV actuel pour donner un score de compatibilité.
            </Typography>

            {!cvHasContent(cvData) && (
              <Alert severity="warning">
                Ton CV semble vide. Remplis-le (ou importe-le) d'abord pour un audit pertinent.
              </Alert>
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
                  <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                    Google AI Studio
                  </Link>.
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth multiline minRows={6} maxRows={14}
              label="Texte de l'offre d'emploi"
              placeholder="Colle ici la description du poste, les compétences requises…"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />

            {phase === 'error' && <Alert severity="error">{error}</Alert>}
          </Stack>
        )}

        {phase === 'working' && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ mb: 1.5 }}>Analyse de l'offre et audit en cours…</Typography>
            <LinearProgress />
          </Box>
        )}

        {phase === 'result' && a && (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <ScoreRing score={a.score} />
              <Box sx={{ flex: 1, minWidth: 200 }}>
                {(j.title || j.company) && (
                  <Typography variant="subtitle1" fontWeight={700}>
                    {j.title}{j.company ? ` · ${j.company}` : ''}
                  </Typography>
                )}
                {j.seniority && (
                  <Typography variant="caption" color="text.secondary">Niveau visé : {j.seniority}</Typography>
                )}
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

            {a.reformulate.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <EditNoteIcon color="warning" fontSize="small" /> À reformuler ({a.reformulate.length})
                </Typography>
                <Stack spacing={1}>
                  {a.reformulate.map((r, i) => (
                    <Alert key={i} severity="warning" sx={{ py: 0.2 }}>
                      <strong>{r.keyword}</strong>{r.suggestion ? ` — ${r.suggestion}` : ''}
                    </Alert>
                  ))}
                </Stack>
              </Box>
            )}

            {a.missing.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <ErrorOutlineIcon color="error" fontSize="small" /> Manquant ({a.missing.length})
                </Typography>
                <Stack spacing={1}>
                  {a.missing.map((m, i) => (
                    <Alert key={i} severity="error" sx={{ py: 0.2 }}>
                      <strong>{m.keyword}</strong> ({m.severity}){m.advice ? ` — ${m.advice}` : ''}
                    </Alert>
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
                    {a.recommendations.map((r, i) => (
                      <li key={i}><Typography variant="body2">{r}</Typography></li>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {phase === 'result' ? (
          <>
            <Button onClick={() => setPhase('idle')}>Analyser une autre offre</Button>
            <Button variant="contained" onClick={handleClose}>Terminé</Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={phase === 'working'}>Fermer</Button>
            <Button
              variant="contained" onClick={runAudit}
              disabled={phase === 'working' || jobText.trim().length < 30 || (needsKey && !keyInput.trim())}
            >
              Analyser la compatibilité
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
