import { Container, Typography, Box, Divider } from '@mui/material';
import SEOHead from '@components/common/SEOHead';

export default function MentionsLegales() {
  return (
    <>
      <SEOHead title="Mentions légales" canonical="/mentions-legales" />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h2" component="h1" gutterBottom>Mentions légales</Typography>
        <Divider sx={{ mb: 4 }} />

        <Section title="Éditeur du site">
          <p>Le site Profila est édité à titre personnel.</p>
          <p>Hébergeur : Hostinger International Ltd.</p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>L'ensemble des contenus présents sur ce site (textes, images, code) sont protégés par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable.</p>
        </Section>

        <Section title="Données personnelles">
          <p>Profila ne collecte aucune donnée personnelle. Toutes les informations saisies dans l'application restent exclusivement dans votre navigateur (localStorage). Aucune donnée n'est transmise à un serveur.</p>
        </Section>

        <Section title="Cookies">
          <p>Ce site n'utilise aucun cookie de traçage ou d'analyse. Seul le localStorage est utilisé pour sauvegarder votre CV localement.</p>
        </Section>
      </Container>
    </>
  );
}

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>{title}</Typography>
      <Box sx={{ color: 'text.secondary', lineHeight: 1.8, '& p': { mb: 1 } }}>{children}</Box>
    </Box>
  );
}
