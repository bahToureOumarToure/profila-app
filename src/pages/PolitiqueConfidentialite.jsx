import { Container, Typography, Box, Divider } from '@mui/material';
import SEOHead from '@components/common/SEOHead';

export default function PolitiqueConfidentialite() {
  return (
    <>
      <SEOHead title="Politique de confidentialité" canonical="/politique-confidentialite" />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h2" component="h1" gutterBottom>Politique de confidentialité</Typography>
        <Divider sx={{ mb: 4 }} />

        <Box sx={{ color: 'text.secondary', lineHeight: 1.8, '& p': { mb: 2 }, '& h2': { color: 'text.primary', fontWeight: 600, mt: 3, mb: 1 } }}>
          <Typography variant="h5" component="h2">Données collectées</Typography>
          <p>Profila ne collecte, ne stocke et ne transmet aucune donnée personnelle vers des serveurs externes. Toutes les informations que vous saisissez (nom, expériences, compétences, etc.) restent exclusivement dans votre navigateur via le mécanisme localStorage.</p>

          <Typography variant="h5" component="h2">Stockage local</Typography>
          <p>Votre CV est automatiquement sauvegardé dans le localStorage de votre navigateur. Ces données ne quittent jamais votre appareil. Vous pouvez les supprimer à tout moment en effaçant les données de navigation.</p>

          <Typography variant="h5" component="h2">Services tiers</Typography>
          <p>Profila utilise Google Fonts pour le chargement des polices d'écriture. Cette connexion est soumise à la politique de confidentialité de Google.</p>

          <Typography variant="h5" component="h2">Contact</Typography>
          <p>Pour toute question relative à la confidentialité, contactez-nous via le site profila.app.</p>

          <Typography variant="caption" color="text.disabled">Dernière mise à jour : janvier 2025</Typography>
        </Box>
      </Container>
    </>
  );
}
