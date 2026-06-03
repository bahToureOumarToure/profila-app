import { Box, Container, Typography, Link, Divider, Stack, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import { tokens } from '@theme/tokens';

const LEGAL_LINKS = [
  { label: 'Mentions légales',              to: '/mentions-legales' },
  { label: 'Politique de confidentialité',  to: '/politique-confidentialite' },
  { label: "Conditions d'utilisation",      to: '/conditions-utilisation' },
];

const CREATOR = {
  name:     'Bah Omar Touré',
  website:  'https://bahoumartoure.com',
  email:    'o.t.bahtoure@gmail.com',
  phone:    '+212705107686',
  linkedin: 'https://www.linkedin.com/in/bahoumartoure/',
  github:   'https://github.com/bahToureOumarToure',
};

const SOCIAL_LINKS = [
  { icon: <LanguageIcon fontSize="small" />, href: CREATOR.website,  label: 'Site web' },
  { icon: <LinkedInIcon fontSize="small" />, href: CREATOR.linkedin,  label: 'LinkedIn' },
  { icon: <GitHubIcon fontSize="small" />,   href: CREATOR.github,    label: 'GitHub' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: tokens.colors.primary[900],
        color: 'rgba(255,255,255,0.85)',
        py: { xs: 5, md: 6 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
          spacing={4}
        >
          {/* Brand */}
          <Box textAlign={{ xs: 'center', md: 'left' }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} mb={0.5}>
              <Box component="img" src="/icone_perso/profila.png" alt="Logo Profila"
                sx={{ width: 30, height: 30, objectFit: 'contain' }} />
              <Typography variant="h6" fontWeight={700} color="#fff">
                Profila
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 260 }}>
              Créez votre CV professionnel en quelques minutes, gratuitement.
            </Typography>
          </Box>

          {/* Creator contact */}
          <Box textAlign={{ xs: 'center', md: 'left' }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', display: 'block', mb: 1.5 }}>
              Créateur
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#fff', mb: 1 }}>
              {CREATOR.name}
            </Typography>

            {/* Contact rows */}
            <Stack spacing={0.75} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Link
                href={`mailto:${CREATOR.email}`}
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
              >
                <EmailOutlinedIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">{CREATOR.email}</Typography>
              </Link>
              <Link
                href={`tel:${CREATOR.phone}`}
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
              >
                <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">{CREATOR.phone}</Typography>
              </Link>
            </Stack>

            {/* Social icons */}
            <Stack direction="row" spacing={0.5} mt={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
              {SOCIAL_LINKS.map((s) => (
                <Tooltip key={s.label} title={s.label} arrow>
                  <IconButton
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: 'rgba(255,255,255,0.65)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': { color: '#fff', borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Box>

          {/* Legal links */}
          <Stack
            direction="column"
            spacing={1}
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em' }}>
              Légal
            </Typography>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.to}
                component={RouterLink}
                to={link.to}
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#fff' } }}
                underline="hover"
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.12)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
            © {new Date().getFullYear()} Profila-Tous droits réservés
          </Typography>
          <Link
            href={CREATOR.website}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ color: 'rgba(255,255,255,0.45)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}
          >
            <Typography variant="caption">
              Créé par {CREATOR.name}
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
