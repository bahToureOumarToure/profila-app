import { Helmet } from 'react-helmet-async';

export default function SEOHead({ title, description, canonical }) {
  const fullTitle = title ? `${title} | Profila` : 'Profila-Créez votre CV professionnel en ligne';
  const desc = description || 'Créez un CV professionnel et moderne en quelques minutes. Templates élégants, export PDF haute qualité. 100% gratuit.';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {canonical && <link rel="canonical" href={`https://profila.app${canonical}`} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
    </Helmet>
  );
}
