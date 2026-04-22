import { Container, Typography, Box, Divider } from '@mui/material';
import SEOHead from '@components/common/SEOHead';

export default function ConditionsUtilisation() {
  return (
    <>
      <SEOHead title="Conditions d'utilisation" canonical="/conditions-utilisation" />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h2" component="h1" gutterBottom>{"Conditions d'utilisation"}</Typography>
        <Divider sx={{ mb: 4 }} />

        <Box sx={{ color: 'text.secondary', lineHeight: 1.8, '& p': { mb: 2 }, '& h2': { color: 'text.primary', fontWeight: 600, mt: 3, mb: 1 } }}>
          <Typography variant="h5" component="h2">Acceptation des conditions</Typography>
          <p>En utilisant Profila, vous acceptez les présentes conditions d'utilisation. L'application est mise à disposition gratuitement, sans garantie d'aucune sorte.</p>

          <Typography variant="h5" component="h2">Utilisation autorisée</Typography>
          <p>Profila est destiné à un usage personnel et professionnel licite-création de CV, portfolio ou tout document professionnel. Toute utilisation frauduleuse est strictement interdite.</p>

          <Typography variant="h5" component="h2">Propriété des données</Typography>
          <p>Les données saisies dans Profila vous appartiennent entièrement. L'éditeur n'en revendique aucun droit.</p>

          <Typography variant="h5" component="h2">Limitation de responsabilité</Typography>
          <p>Profila est fourni "tel quel". L'éditeur ne saurait être tenu responsable des pertes de données dues à une effacement du localStorage ou à un dysfonctionnement du navigateur. Pensez à exporter régulièrement votre CV en JSON.</p>

          <Typography variant="h5" component="h2">Modification des conditions</Typography>
          <p>Ces conditions peuvent être modifiées à tout moment. La date de dernière mise à jour est indiquée ci-dessous.</p>

          <Typography variant="caption" color="text.disabled">Dernière mise à jour : janvier 2025</Typography>
        </Box>
      </Container>
    </>
  );
}
