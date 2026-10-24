// Aperçu = le PDF réel, rendu en canvas par pdf.js. Ce que l'on voit est
// exactement ce qui sera téléchargé (mêmes polices, mêmes espacements, même
// pagination) : plus de divergence entre un aperçu HTML et l'export.
import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Chip, IconButton, Tooltip, CircularProgress, Stack, Alert,
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CompressIcon from '@mui/icons-material/Compress';
import { useCV } from '@context/CVContext';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { renderResume } from '@components/pdf/renderResume';
import { setLayoutInfo } from '@components/pdf/layoutInfo';

const A4_CSS_WIDTH = 794; // largeur A4 à 96 dpi
const ZOOMS = [0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5];

async function drawPages(doc, cssWidth, container, isCurrent) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const nodes = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: (cssWidth / base.width) * dpr });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${(cssWidth / base.width) * base.height}px`;
    canvas.style.display = 'block';
    canvas.setAttribute('aria-label', `Page ${i} du CV`);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    if (!isCurrent()) return;

    const sheet = document.createElement('div');
    sheet.style.cssText = 'background:#fff;box-shadow:0 4px 18px rgba(15,23,42,.18);margin:0 auto 18px;position:relative;';
    sheet.appendChild(canvas);
    if (i > 1) {
      const tag = document.createElement('div');
      tag.textContent = `Page ${i}`;
      tag.style.cssText = 'position:absolute;top:6px;right:8px;font:600 11px Inter,sans-serif;color:#b45309;background:#fff7ed;border:1px solid #fdba74;border-radius:10px;padding:1px 8px;';
      sheet.appendChild(tag);
    }
    nodes.push(sheet);
  }
  // Remplacement en une fois : pas de clignotement pendant la frappe.
  if (isCurrent()) container.replaceChildren(...nodes);
}

export default function CVPreview() {
  const { cvData } = useCV();
  const data = useDebouncedValue(cvData, 450);
  const [status, setStatus] = useState({ busy: true, pages: 0, fitted: false, fitLevel: 0, error: '' });
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const wrapRef = useRef(null);
  const pagesRef = useRef(null);
  const docRef = useRef(null);
  const jobRef = useRef(0);
  const drawRef = useRef(0);
  const retiredRef = useRef([]);
  const [docVersion, setDocVersion] = useState(0);

  // Largeur disponible (ResizeObserver) → la page s'adapte au panneau.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cssWidth = Math.round(Math.max(260, Math.min(width - 24, A4_CSS_WIDTH)) * zoom);

  // Génération du PDF à chaque modification (après une courte pause de frappe).
  useEffect(() => {
    const job = ++jobRef.current;
    setStatus((s) => ({ ...s, busy: true }));
    (async () => {
      try {
        const res = await renderResume(data);
        if (job !== jobRef.current) return;
        const { default: pdfjs } = await import('@utils/pdfjs');
        const doc = await pdfjs.getDocument({ data: new Uint8Array(res.buffer.slice(0)) }).promise;
        if (job !== jobRef.current) { doc.destroy(); return; }
        // L'ancien document reste affiché jusqu'au dessin du nouveau.
        retiredRef.current.push(docRef.current);
        docRef.current = doc;
        setDocVersion((v) => v + 1);
        setLayoutInfo({ pages: res.pages, fitted: res.fitted });
        setStatus({ busy: false, pages: res.pages, fitted: res.fitted, fitLevel: res.fitLevel, error: '' });
      } catch (e) {
        if (job === jobRef.current) setStatus((s) => ({ ...s, busy: false, error: e.message || String(e) }));
      }
    })();
  }, [data]);

  // Dessin : nouveau document, zoom ou redimensionnement (sans régénérer le PDF).
  useEffect(() => {
    const doc = docRef.current;
    if (!doc || !pagesRef.current || !width) return;
    const id = ++drawRef.current;
    drawPages(doc, cssWidth, pagesRef.current, () => id === drawRef.current)
      .then(() => {
        if (id !== drawRef.current) return;
        retiredRef.current.forEach((d) => d?.destroy());
        retiredRef.current = [];
      })
      .catch(() => { /* document détruit pendant le dessin : un nouveau dessin suit */ });
  }, [docVersion, cssWidth, width]);

  useEffect(() => () => docRef.current?.destroy(), []);

  const zoomIndex = ZOOMS.indexOf(zoom);
  const onePage = status.pages === 1;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#e8eaf0' }}>
      <Stack
        direction="row" alignItems="center" spacing={1}
        sx={{ px: 1.5, py: 0.75, borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(255,255,255,0.7)', flexShrink: 0 }}
      >
        {status.pages > 0 && (
          <Tooltip
            arrow
            title={onePage
              ? 'Format idéal pour un stage / premier emploi'
              : "Un CV de stage PFE tient idéalement sur une page : activez « Ajuster sur 1 page » (Design) ou demandez à l'assistant de condenser."}
          >
            <Chip
              size="small"
              color={onePage ? 'success' : 'warning'}
              icon={onePage ? <CheckCircleIcon /> : <WarningAmberIcon />}
              label={`${status.pages} page${status.pages > 1 ? 's' : ''}`}
            />
          </Tooltip>
        )}
        {status.fitted && (
          <Tooltip arrow title="Espacements et taille du texte resserrés automatiquement pour tenir sur une page (désactivable dans Design).">
            <Chip size="small" variant="outlined" icon={<CompressIcon />} label="Ajusté sur 1 page" />
          </Tooltip>
        )}
        {status.busy && <CircularProgress size={14} thickness={5} />}
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Zoom arrière">
          <span>
            <IconButton size="small" disabled={zoomIndex <= 0} onClick={() => setZoom(ZOOMS[zoomIndex - 1])}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="caption" sx={{ minWidth: 38, textAlign: 'center' }}>{Math.round(zoom * 100)} %</Typography>
        <Tooltip title="Zoom avant">
          <span>
            <IconButton size="small" disabled={zoomIndex >= ZOOMS.length - 1} onClick={() => setZoom(ZOOMS[zoomIndex + 1])}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Ajuster à la largeur">
          <IconButton size="small" onClick={() => setZoom(1)}><FitScreenIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Stack>

      <Box ref={wrapRef} sx={{ flexGrow: 1, overflow: 'auto', p: 1.5 }} data-testid="cv-preview">
        {status.error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>Aperçu indisponible : {status.error}</Alert>
        )}
        {!status.pages && status.busy && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        )}
        <Box ref={pagesRef} sx={{ width: cssWidth, mx: 'auto' }} />
      </Box>
    </Box>
  );
}
