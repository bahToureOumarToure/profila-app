// Dialogue avec l'IA sur le CV : questions libres, demandes de réécriture,
// conseils ATS. Chaque modification proposée s'affiche en avant/après et ne
// s'applique qu'après validation ; « Annuler » restaure l'état précédent.
import { useEffect, useRef, useState, Fragment } from 'react';
import { v4 as uuid } from 'uuid';
import {
  Box, Stack, Typography, TextField, IconButton, Button, Chip, Alert, Paper, Checkbox,
  Tooltip, Collapse, CircularProgress, Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useCV } from '@context/CVContext';
import { askAssistant, applyActionsToCV } from '@ai/cvAssistant';
import { hasApiKey } from '@ai/geminiClient';
import { getLayoutInfo } from '@components/pdf/layoutInfo';
import { parseInlineBold } from '@utils/cvHelpers';

const STORAGE_KEY = 'profila_assistant_chat';

const STARTERS = [
  'Rends mon profil plus percutant pour un stage PFE',
  'Transforme mes expériences en puces orientées résultats',
  'Mon CV tient-il sur une page ? Condense-le si besoin',
  "Quelles compétences mettre en avant pour l'offre ciblée ?",
  "Corrige l'orthographe et harmonise la ponctuation",
  "Quels sont les 3 points faibles de mon CV pour un recruteur ?",
];

function loadChat() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { messages: Array.isArray(raw.messages) ? raw.messages : [], jobText: raw.jobText || '' };
  } catch {
    return { messages: [], jobText: '' };
  }
}

function InlineText({ text }) {
  return parseInlineBold(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <Fragment key={i}>{p.text}</Fragment>));
}

// Rendu minimal : paragraphes, listes « - », **gras**.
function MessageText({ text }) {
  const blocks = [];
  String(text || '').split('\n').forEach((line) => {
    const t = line.trim();
    if (!t) return;
    const bullet = /^[-•*]\s+/.test(t);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.type === 'ul') last.items.push(t.replace(/^[-•*]\s+/, ''));
      else blocks.push({ type: 'ul', items: [t.replace(/^[-•*]\s+/, '')] });
    } else blocks.push({ type: 'p', text: t });
  });
  return blocks.map((b, i) => (b.type === 'ul' ? (
    <Box key={i} component="ul" sx={{ m: 0, pl: 2.5, my: 0.5 }}>
      {b.items.map((it, j) => <li key={j}><Typography variant="body2"><InlineText text={it} /></Typography></li>)}
    </Box>
  ) : (
    <Typography key={i} variant="body2" sx={{ my: 0.5 }}><InlineText text={b.text} /></Typography>
  )));
}

const STATUS_CHIP = {
  appliquée: { label: 'Appliquée', color: 'success' },
  ignorée: { label: 'Ignorée', color: 'default' },
};

function ActionCard({ action, selected, onToggle, locked }) {
  const status = STATUS_CHIP[action.status];
  return (
    <Paper variant="outlined" sx={{ p: 1.25, opacity: action.status === 'ignorée' ? 0.6 : 1 }}>
      <Stack direction="row" alignItems="flex-start" spacing={0.5}>
        {!locked && <Checkbox size="small" checked={selected} onChange={onToggle} sx={{ p: 0.25, mt: -0.25 }} />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>{action.title}</Typography>
            {status && <Chip size="small" color={status.color} label={status.label} />}
          </Stack>
          {action.reason && <Typography variant="caption" color="text.secondary" display="block">{action.reason}</Typography>}
          {action.changes.map((c) => (
            <Box key={c.field} sx={{ mt: 0.75 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">{c.label}</Typography>
              {c.before !== '-' && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', textDecoration: 'line-through', color: 'text.disabled', fontSize: '0.78rem' }}>
                  {c.before}
                </Typography>
              )}
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(76,175,80,0.15)' : '#edf7ed'), borderRadius: 1, px: 0.75, py: 0.25 }}>
                {c.after}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

function AssistantMessage({ msg, onApply, onIgnore, onSuggestion, busy }) {
  const pending = (msg.actions || []).filter((a) => !a.status);
  const [selected, setSelected] = useState(() => Object.fromEntries(pending.map((a) => [a.key, true])));
  const count = pending.filter((a) => selected[a.key]).length;

  return (
    <Box>
      <MessageText text={msg.text} />
      {msg.actions?.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {msg.actions.map((a) => (
            <ActionCard
              key={a.key} action={a} locked={Boolean(a.status)} selected={Boolean(selected[a.key])}
              onToggle={() => setSelected((s) => ({ ...s, [a.key]: !s[a.key] }))}
            />
          ))}
          {pending.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small" variant="contained" startIcon={<CheckIcon />} disabled={!count || busy}
                onClick={() => onApply(msg.id, pending.filter((a) => selected[a.key]).map((a) => a.key))}
              >
                Appliquer ({count})
              </Button>
              <Button size="small" onClick={() => onIgnore(msg.id)} disabled={busy}>Tout ignorer</Button>
            </Stack>
          )}
        </Stack>
      )}
      {msg.suggestions?.length > 0 && (
        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {msg.suggestions.map((s) => (
            <Chip key={s} size="small" variant="outlined" label={s} onClick={() => onSuggestion(s)} disabled={busy} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function CVAssistantPanel() {
  const { cvData, loadCV, undo, canUndo, lastChangeLabel } = useCV();
  const [{ messages, jobText }, setChat] = useState(loadChat);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const listRef = useRef(null);
  const keyMissing = !hasApiKey();

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: messages.slice(-40), jobText })); } catch { /* quota */ }
  }, [messages, jobText]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const setMessages = (fn) => setChat((c) => ({ ...c, messages: fn(c.messages) }));

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const userMsg = { id: uuid(), role: 'user', text: content };
    const history = [...messages.filter((m) => m.role !== 'error'), userMsg];
    setMessages((m) => [...m.filter((x) => x.role !== 'error'), userMsg]);
    setInput('');
    setBusy(true);
    try {
      const res = await askAssistant({ cv: cvData, messages: history, jobText, pages: getLayoutInfo()?.pages });
      setMessages((m) => [...m, { id: uuid(), role: 'assistant', text: res.reply, actions: res.actions, suggestions: res.suggestions }]);
    } catch (e) {
      setMessages((m) => [...m, { id: uuid(), role: 'error', text: e.message || 'Erreur inconnue.', retry: content }]);
    } finally {
      setBusy(false);
    }
  };

  const markActions = (msgId, keys, status) => setMessages((list) => list.map((m) => (m.id !== msgId ? m : {
    ...m,
    actions: m.actions.map((a) => (keys.includes(a.key) ? { ...a, status } : a)),
  })));

  const apply = (msgId, keys) => {
    const msg = messages.find((m) => m.id === msgId);
    const chosen = msg.actions.filter((a) => keys.includes(a.key));
    loadCV(applyActionsToCV(cvData, chosen), `Assistant IA : ${chosen.length} modification(s)`);
    markActions(msgId, keys, 'appliquée');
    markActions(msgId, msg.actions.filter((a) => !a.status && !keys.includes(a.key)).map((a) => a.key), 'ignorée');
  };

  const ignore = (msgId) => {
    const msg = messages.find((m) => m.id === msgId);
    markActions(msgId, msg.actions.filter((a) => !a.status).map((a) => a.key), 'ignorée');
  };

  const reset = () => {
    if (messages.length && !window.confirm('Effacer la conversation ?')) return;
    setMessages(() => []);
  };

  return (
    <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      {/* En-tête */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <AutoAwesomeIcon color="primary" fontSize="small" />
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>Assistant CV</Typography>
        <Tooltip title="Coller l'offre visée : l'assistant s'en sert pour cibler ses conseils">
          <Chip
            size="small" icon={<WorkOutlineIcon />} onClick={() => setJobOpen((o) => !o)}
            color={jobText.trim() ? 'success' : 'default'} variant={jobText.trim() ? 'filled' : 'outlined'}
            label={jobText.trim() ? 'Offre ciblée ✓' : 'Cibler une offre'}
          />
        </Tooltip>
        {canUndo && (
          <Tooltip title={`Annuler : ${lastChangeLabel}`}>
            <IconButton size="small" onClick={undo}><UndoIcon fontSize="small" /></IconButton>
          </Tooltip>
        )}
        <Tooltip title="Nouvelle conversation">
          <span><IconButton size="small" onClick={reset} disabled={busy}><DeleteSweepOutlinedIcon fontSize="small" /></IconButton></span>
        </Tooltip>
      </Stack>

      <Collapse in={jobOpen}>
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth multiline minRows={3} maxRows={8} size="small"
            label="Offre d'emploi / de stage ciblée"
            placeholder="Colle ici le texte de l'offre (missions, compétences requises…)"
            value={jobText}
            onChange={(e) => setChat((c) => ({ ...c, jobText: e.target.value }))}
          />
        </Box>
      </Collapse>

      {/* Messages */}
      <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 1.5 }} data-testid="assistant-messages">
        {keyMissing && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            Clé API Gemini non configurée : définis <strong>VITE_GEMINI_API_KEY</strong> dans <code>.env</code> puis relance le build.
          </Alert>
        )}
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Discute avec l'assistant de ton CV : pose une question, demande une réécriture,
              un avis de recruteur ou une version ciblée pour une offre. Il voit ton CV à jour
              et propose des modifications que tu valides une par une.
            </Typography>
            <Stack spacing={0.75} alignItems="center">
              {STARTERS.map((s) => (
                <Chip key={s} label={s} variant="outlined" onClick={() => send(s)} disabled={busy || keyMissing} sx={{ maxWidth: '100%' }} />
              ))}
            </Stack>
          </Box>
        )}
        <Stack spacing={1.5}>
          {messages.map((m) => {
            if (m.role === 'user') {
              return (
                <Box key={m.id} sx={{ alignSelf: 'flex-end', maxWidth: '88%', bgcolor: 'primary.main', color: 'primary.contrastText', px: 1.5, py: 1, borderRadius: '14px 14px 4px 14px' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{m.text}</Typography>
                </Box>
              );
            }
            if (m.role === 'error') {
              return (
                <Alert key={m.id} severity="error" action={<Button size="small" color="inherit" onClick={() => send(m.retry)} disabled={busy}>Réessayer</Button>}>
                  {m.text}
                </Alert>
              );
            }
            return (
              <Box key={m.id} sx={{ maxWidth: '100%', bgcolor: 'action.hover', px: 1.5, py: 1, borderRadius: '14px 14px 14px 4px' }}>
                <AssistantMessage msg={m} onApply={apply} onIgnore={ignore} onSuggestion={send} busy={busy} />
              </Box>
            );
          })}
          {busy && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
              <CircularProgress size={14} />
              <Typography variant="caption">L'assistant analyse ton CV…</Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      <Divider />
      {/* Saisie */}
      <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ p: 1.25 }}>
        <TextField
          fullWidth multiline maxRows={5} size="small"
          placeholder="Écris ton message… (Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          disabled={keyMissing}
          inputProps={{ 'aria-label': "Message pour l'assistant" }}
        />
        <IconButton color="primary" onClick={() => send()} disabled={!input.trim() || busy || keyMissing} aria-label="Envoyer">
          <SendIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}
