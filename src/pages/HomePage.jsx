import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  Stack, Chip, Avatar,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SEOHead from '@components/common/SEOHead';
import { tokens } from '@theme/tokens';
import { alpha } from '@mui/material/styles';
import { CV_TEMPLATES } from '@data/initialCVData';
import { useCV } from '@context/CVContext';

// ── Moteur IA : étapes mises en avant sur l'accueil ──────────────────────────
const AI_STEPS = [
  {
    icon: <UploadFileOutlinedIcon />,
    title: 'Importez votre ancien CV (PDF)',
    description: "L'IA lit votre PDF et pré-remplit automatiquement l'éditeur. Plus besoin de tout retaper.",
  },
  {
    icon: <ForumOutlinedIcon />,
    title: 'Dialoguez avec votre CV',
    description: "Demandez une réécriture, un avis de recruteur ou une version plus courte : l'assistant propose, vous validez chaque modification (et pouvez annuler).",
  },
  {
    icon: <GpsFixedIcon />,
    title: 'Ciblez une offre',
    description: "Collez une annonce : score de compatibilité ATS, mots-clés manquants et optimisations honnêtes, sans rien inventer.",
  },
];

// ── Templates présentés (mock visuel léger, sans image) ──────────────────────
const TEMPLATES = CV_TEMPLATES.map((t) => ({ ...t, accent: t.defaultColor }));

// Miniature schématique : une colonne, comme les PDF générés.
function TemplateThumb({ id, accent }) {
  const line = (w, key, o = 0.5) => (
    <Box key={key} sx={{ height: 4, borderRadius: 1, bgcolor: alpha('#000', o * 0.25), width: w, mb: 0.6 }} />
  );
  const heading = (key) => (
    <Box key={key} sx={{ mt: 1, mb: 0.6 }}>
      <Box sx={{ height: 5, width: '38%', borderRadius: 1, bgcolor: id === 'minimal' ? alpha('#000', 0.75) : accent }} />
      <Box sx={{ height: '1px', bgcolor: id === 'minimal' ? alpha('#000', 0.6) : accent, mt: 0.4 }} />
    </Box>
  );
  const photo = { ats: 'right', classic: 'left-round', modern: 'left' }[id];
  const centered = id === 'classic' || id === 'minimal';
  return (
    <Box sx={{ aspectRatio: '1 / 1.414', bgcolor: '#fff', borderRadius: 1.5, overflow: 'hidden',
      border: '1px solid', borderColor: 'divider', p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: photo === 'right' ? 'row-reverse' : 'row' }}>
        {photo && (
          <Box sx={{ width: 26, height: 26, flexShrink: 0, bgcolor: alpha(accent, 0.25),
            borderRadius: photo === 'left-round' ? '50%' : 0.5 }} />
        )}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: centered ? 'center' : 'flex-start' }}>
          <Box sx={{ height: 7, width: '55%', borderRadius: 1, mb: 0.6,
            bgcolor: id === 'classic' || id === 'modern' ? accent : alpha('#000', 0.75) }} />
          <Box sx={{ height: 3, width: '75%', borderRadius: 1, bgcolor: alpha('#000', 0.3), mb: 0.4 }} />
          <Box sx={{ height: 3, width: '60%', borderRadius: 1, bgcolor: alpha('#000', 0.2) }} />
        </Box>
      </Box>
      {heading('h1')}
      {[0.95, 0.9, 0.6].map((w, i) => line(`${w * 100}%`, `a${i}`))}
      {heading('h2')}
      {[0.85, 0.92, 0.7, 0.88].map((w, i) => line(`${w * 100}%`, `b${i}`))}
      {heading('h3')}
      {[0.9, 0.75, 0.82].map((w, i) => line(`${w * 100}%`, `c${i}`))}
    </Box>
  );
}

const FEATURES = [
  {
    icon: <AutoAwesomeIcon />,
    title: '4 templates optimisés ATS',
    description: 'Ingénieur, Académique, Moderne, Minimaliste : une colonne, texte réel, titres standards, liens cliquables.',
  },
  {
    icon: <PictureAsPdfOutlinedIcon />,
    title: 'Aperçu = PDF final',
    description: "L'aperçu affiche le vrai PDF : ce que vous voyez est exactement ce que vous téléchargez, ajusté sur une page.",
  },
  {
    icon: <SpeedOutlinedIcon />,
    title: 'Analyse ATS instantanée',
    description: 'Score et corrections concrètes (dates, coordonnées, puces, chiffres) sans envoyer vos données.',
  },
  {
    icon: <PaletteOutlinedIcon />,
    title: 'Mise en page maîtrisée',
    description: 'Densité, taille du texte, polices nettes, ordre et titres des sections, sections masquables.',
  },
  {
    icon: <LockOutlinedIcon />,
    title: 'Données privées',
    description: "Tout reste dans votre navigateur. Seuls les textes envoyés à l'assistant IA quittent votre machine, à votre demande.",
  },
  {
    icon: <DevicesOutlinedIcon />,
    title: 'Full Responsive',
    description: 'Créez votre CV depuis votre téléphone, tablette ou ordinateur.',
  },
];

const STEPS = [
  { number: '01', title: 'Remplissez vos informations', desc: 'Expériences, formations, compétences-guidé étape par étape.' },
  { number: '02', title: 'Choisissez votre template', desc: "Sélectionnez le design qui correspond à votre secteur d'activité." },
  { number: '03', title: 'Téléchargez votre PDF', desc: 'Un CV professionnel prêt à envoyer en quelques secondes.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { updateMeta } = useCV();

  const applyTemplate = (t) => {
    updateMeta({ template: t.id, fontFamily: t.defaultFont, colorScheme: { primary: t.defaultColor, secondary: t.defaultColor } });
    navigate('/builder');
  };

  return (
    <>
      <SEOHead canonical="/" />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          background: `linear-gradient(160deg, ${tokens.colors.primary[900]} 0%, ${tokens.colors.primary[700]} 60%, ${tokens.colors.primary[400]} 100%)`,
          color: '#fff',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: alpha('#fff', 0.04), pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -80, left: -80,
          width: 350, height: 350, borderRadius: '50%',
          background: alpha('#fff', 0.03), pointerEvents: 'none',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Box
            sx={{
              width: 76, height: 76, borderRadius: '22px', mx: 'auto', mb: 3,
              bgcolor: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            <Box component="img" src="/icone_perso/profila.png" alt="Logo Profila"
              sx={{ width: 54, height: 54, objectFit: 'contain' }} />
          </Box>
          <Chip
            label="100% Gratuit · Aucune inscription"
            size="small"
            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              mb: 3, backgroundColor: alpha('#fff', 0.15), color: '#fff',
              fontWeight: 600, fontSize: '0.75rem',
              '& .MuiChip-icon': { color: '#fff' },
            }}
          />
          <Typography variant="h1" component="h1" sx={{ color: '#fff', mb: 3 }}>
            Créez votre CV{' '}
            <Box component="span" sx={{ color: tokens.colors.secondary[400] }}>
              professionnel
            </Box>
            {' '}en ligne
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ color: 'rgba(255,255,255,0.82)', mb: 5, fontWeight: 400, maxWidth: 560, mx: 'auto' }}
          >
            Des templates optimisés ATS, un assistant IA avec qui dialoguer et un export PDF d'une page, gratuitement.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/builder')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: tokens.colors.secondary[600],
                color: '#000',
                px: 4,
                '&:hover': { backgroundColor: tokens.colors.secondary[500] },
              }}
            >
              Créer mon CV gratuitement
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', px: 4,
                '&:hover': { borderColor: '#fff', backgroundColor: alpha('#fff', 0.08) } }}
            >
              Voir les templates
            </Button>
          </Stack>

          {/* Social proof */}
          <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mt: 5 }}>
            <Stack direction="row">
              {['#7986cb','#5c6bc0','#3f51b5','#3949ab'].map((c, i) => (
                <Avatar key={i} sx={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.6)', ml: i ? -0.75 : 0, bgcolor: c, fontSize: 11 }}>
                  {String.fromCharCode(65 + i)}
                </Avatar>
              ))}
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Rejoignez des milliers d'utilisateurs satisfaits
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* ── Moteur IA ──────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={7}>
            <Chip
              label="Nouveau · Propulsé par l'IA"
              size="small"
              icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important' }} />}
              color="primary"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            <Typography variant="h2" component="h2">
              Un assistant IA pour décrocher l'entretien
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 640, mx: 'auto' }}>
              Profila ne se contente pas de mettre en forme : il adapte votre CV à chaque offre
              pour passer les filtres ATS-en gardant le contrôle sur chaque modification.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
            <Box
              component="img"
              src="/icone_perso/experience.png"
              alt="Assistant IA Profila"
              sx={{ width: { xs: 200, md: 260 }, height: 'auto' }}
            />
          </Box>

          <Grid container spacing={3}>
            {AI_STEPS.map((s, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card sx={{ height: '100%', p: 1, position: 'relative', overflow: 'visible',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: tokens.shadows.cardHover } }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                      <Avatar sx={{ bgcolor: tokens.colors.primary[900], color: '#fff', width: 44, height: 44 }}>
                        {s.icon}
                      </Avatar>
                      <Typography variant="overline" color="primary" fontWeight={700}>Étape {idx + 1}</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={600} gutterBottom>{s.title}</Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{s.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={5}>
            <Button variant="contained" size="large" onClick={() => navigate('/builder')} endIcon={<ArrowForwardIcon />}>
              Essayer l'assistant IA
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Comment ça marche ──────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: tokens.colors.neutral[50] }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={7}>
            <Typography variant="overline" color="primary" fontWeight={700} letterSpacing="0.1em">
              Comment ça marche
            </Typography>
            <Typography variant="h2" component="h2" mt={1}>
              Votre CV en 3 étapes
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {STEPS.map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Box textAlign="center" sx={{ px: { xs: 2, md: 3 } }}>
                  <Typography
                    variant="h1"
                    component="div"
                    sx={{
                      fontSize: '4rem', fontWeight: 800, lineHeight: 1,
                      color: alpha(tokens.colors.primary[900], 0.08),
                      mb: 2,
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Templates ──────────────────────────────────────────────────────── */}
      <Box component="section" id="templates" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={7}>
            <Typography variant="overline" color="primary" fontWeight={700} letterSpacing="0.1em">
              Templates
            </Typography>
            <Typography variant="h2" component="h2" mt={1}>
              Des modèles prêts à l'emploi
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 560, mx: 'auto' }}>
              Choisissez un design, l'IA s'occupe du contenu. Vous changez de template à tout moment,
              sans ressaisir vos informations.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {TEMPLATES.map((t) => (
              <Grid item xs={12} sm={6} md={3} key={t.id}>
                <Card sx={{ overflow: 'hidden', height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: tokens.shadows.cardHover } }}>
                  <Box sx={{ p: 2, bgcolor: tokens.colors.neutral[50] }}>
                    <TemplateThumb id={t.id} accent={t.accent} />
                  </Box>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                      <Typography variant="h6" fontWeight={700}>{t.label}</Typography>
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: t.accent }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t.description}</Typography>
                    <Button fullWidth variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => applyTemplate(t)}>
                      Utiliser ce template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, backgroundColor: tokens.colors.neutral[50] }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={7}>
            <Typography variant="overline" color="primary" fontWeight={700} letterSpacing="0.1em">
              Fonctionnalités
            </Typography>
            <Typography variant="h2" component="h2" mt={1}>
              Tout ce dont vous avez besoin
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {FEATURES.map((f, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  sx={{
                    height: '100%', p: 1,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: tokens.shadows.cardHover },
                  }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: alpha(tokens.colors.primary[900], 0.1),
                        color: tokens.colors.primary[900],
                        width: 44, height: 44, mb: 2,
                      }}
                    >
                      {f.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {f.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          background: `linear-gradient(135deg, ${tokens.colors.primary[900]} 0%, ${tokens.colors.primary[700]} 100%)`,
          py: { xs: 8, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h2" component="h2" sx={{ color: '#fff', mb: 2 }}>
            Prêt à vous démarquer ?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 4 }}>
            Créez votre CV professionnel maintenant-aucune inscription requise.
          </Typography>

          <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" mb={3}>
            {['Gratuit', 'Sans inscription', 'Export PDF', 'Données privées'].map((tag) => (
              <Chip
                key={tag}
                icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.9) !important' }} />}
                label={tag}
                size="small"
                sx={{ backgroundColor: alpha('#fff', 0.15), color: '#fff', fontWeight: 500 }}
              />
            ))}
          </Stack>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/builder')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              backgroundColor: tokens.colors.secondary[600],
              color: '#000',
              px: 5, py: 1.75, fontSize: '1rem',
              '&:hover': { backgroundColor: tokens.colors.secondary[500] },
            }}
          >
            Créer mon CV maintenant
          </Button>
        </Container>
      </Box>
    </>
  );
}
