import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  Stack, Chip, Avatar, useTheme, useMediaQuery,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SEOHead from '@components/common/SEOHead';
import { tokens } from '@theme/tokens';
import { alpha } from '@mui/material/styles';

const FEATURES = [
  {
    icon: <AutoAwesomeIcon />,
    title: 'Templates professionnels',
    description: '3 modèles élégants (Moderne, Classique, Minimaliste) pensés pour maximiser vos chances.',
  },
  {
    icon: <PictureAsPdfOutlinedIcon />,
    title: 'Export PDF haute qualité',
    description: 'Générez un PDF impeccable prêt à envoyer, avec une mise en page parfaite.',
  },
  {
    icon: <SpeedOutlinedIcon />,
    title: 'Éditeur en temps réel',
    description: 'Votre CV se met à jour instantanément pendant la saisie. Aucun délai.',
  },
  {
    icon: <PaletteOutlinedIcon />,
    title: 'Personnalisation complète',
    description: 'Couleurs, typographie, sections-adaptez chaque détail à votre image.',
  },
  {
    icon: <LockOutlinedIcon />,
    title: 'Données 100% privées',
    description: 'Tout reste dans votre navigateur. Aucune donnée envoyée sur un serveur.',
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
            Des templates modernes, un éditeur intuitif et un export PDF haute qualité-gratuitement.
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
              onClick={() => navigate('/builder')}
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

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
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
