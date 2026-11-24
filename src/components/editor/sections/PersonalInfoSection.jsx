import { useRef, useState } from 'react';
import {
  Grid, TextField, Box, Avatar, Button, Typography, IconButton, Tooltip, Stack, FormControlLabel, Switch,
} from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import { useCV } from '@context/CVContext';
import { getInitials, boldKeywords, toggleBold, stripInlineMarkup } from '@utils/cvHelpers';
import { tokens } from '@theme/tokens';

export default function PersonalInfoSection() {
  const { cvData, updatePersonalInfo, updateMeta } = useCV();
  const summaryRef = useRef(null);
  const [keywordInfo, setKeywordInfo] = useState('');
  const { personalInfo } = cvData;
  const fileInputRef = useRef(null);

  const handleChange = (field) => (e) => updatePersonalInfo({ [field]: e.target.value });

  // La photo est recadrée en carré et convertie en JPEG 400 px : le PDF n'accepte
  // que JPEG/PNG, et une image légère préserve le localStorage.
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert('Photo trop lourde (max 8 Mo)'); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const size = Math.min(400, side);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, size, size);
      // Recadrage centré, légèrement vers le haut (visage).
      const sx = (img.naturalWidth - side) / 2;
      const sy = Math.max(0, (img.naturalHeight - side) / 3);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      updatePersonalInfo({ photo: canvas.toDataURL('image/jpeg', 0.88) });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); alert('Format d’image non pris en charge.'); };
    img.src = url;
  };

  return (
    <Box>
      {/* Photo upload */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          src={personalInfo.photo || undefined}
          sx={{ width: 72, height: 72, bgcolor: tokens.colors.primary[200], fontSize: '1.5rem' }}
        >
          {!personalInfo.photo && getInitials(personalInfo.firstName, personalInfo.lastName)}
        </Avatar>
        <Box>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<PhotoCameraOutlinedIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            {personalInfo.photo ? 'Changer' : 'Ajouter une photo'}
          </Button>
          {personalInfo.photo && (
            <Tooltip title="Supprimer la photo">
              <IconButton size="small" onClick={() => updatePersonalInfo({ photo: '' })} sx={{ ml: 1 }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            JPG, PNG, WebP · recadrée en carré
          </Typography>
        </Box>
      </Box>

      {/* Fields */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Prénom" value={personalInfo.firstName} onChange={handleChange('firstName')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Nom" value={personalInfo.lastName} onChange={handleChange('lastName')} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Titre professionnel ciblé" placeholder="ex. Élève-ingénieur en génie informatique" value={personalInfo.title} onChange={handleChange('title')} />
          <FormControlLabel
            control={(
              <Switch
                size="small" checked={cvData.meta.highlightTitle !== false}
                onChange={(e) => updateMeta({ highlightTitle: e.target.checked })}
              />
            )}
            label={<Typography variant="body2">Titre en couleur (comme les titres de sections)</Typography>}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Disponibilité / objectif"
            placeholder="ex. Recherche de stage PFE – Février 2027"
            value={personalInfo.availability} onChange={handleChange('availability')}
            helperText="Affichée à côté du titre : type de stage, durée, date de début."
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Email" type="email" value={personalInfo.email} onChange={handleChange('email')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Téléphone" value={personalInfo.phone} onChange={handleChange('phone')} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Ville, pays" placeholder="ex. Casablanca, Maroc" value={personalInfo.location} onChange={handleChange('location')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="LinkedIn" placeholder="linkedin.com/in/..." value={personalInfo.linkedin} onChange={handleChange('linkedin')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="GitHub" placeholder="github.com/..." value={personalInfo.github} onChange={handleChange('github')} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Portfolio / site web" placeholder="ex. https://bahoumartoure.vercel.app" value={personalInfo.website} onChange={handleChange('website')} helperText="Les liens sont cliquables dans le PDF et imprimés en clair (lisibles par les ATS)." />
        </Grid>
        <Grid item xs={12}>
          {/* Mise en valeur des mots-clés du profil : **gras**, et couleur en option. */}
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Tooltip title="Mettre la sélection en gras (ou retirer le gras)">
              <Button
                size="small" variant="outlined" startIcon={<FormatBoldIcon />}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const el = summaryRef.current;
                  if (!el) return;
                  const res = toggleBold(personalInfo.summary, el.selectionStart, el.selectionEnd);
                  updatePersonalInfo({ summary: res.text });
                  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(res.start, res.end); });
                }}
              >
                Gras
              </Button>
            </Tooltip>
            <Tooltip title="Met en gras, dans le profil, les compétences de votre liste qui y sont citées">
              <Button
                size="small" variant="outlined" startIcon={<AutoFixHighIcon />}
                onClick={() => {
                  const res = boldKeywords(personalInfo.summary, cvData.skills.map((sk) => sk.name));
                  updatePersonalInfo({ summary: res.text });
                  setKeywordInfo(res.added.length
                    ? `Mis en gras : ${res.added.join(', ')}`
                    : 'Aucune nouvelle compétence de votre liste trouvée dans le profil.');
                }}
              >
                Mots-clés auto
              </Button>
            </Tooltip>
            <Tooltip title="Retirer tout le gras du profil">
              <span>
                <IconButton
                  size="small" aria-label="Retirer le gras"
                  disabled={!personalInfo.summary.includes('**')}
                  onClick={() => { updatePersonalInfo({ summary: stripInlineMarkup(personalInfo.summary) }); setKeywordInfo(''); }}
                >
                  <FormatClearIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <FormControlLabel
              sx={{ ml: 'auto' }}
              control={(
                <Switch
                  size="small" checked={cvData.meta.colorKeywords === true}
                  onChange={(e) => updateMeta({ colorKeywords: e.target.checked })}
                />
              )}
              label={<Typography variant="body2">Mots-clés en couleur</Typography>}
            />
          </Stack>
          {keywordInfo && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{keywordInfo}</Typography>
          )}
          <TextField
            fullWidth
            multiline
            minRows={4}
            inputRef={summaryRef}
            label="Profil professionnel"
            placeholder="Niveau d'études et spécialité, domaines techniques, réalisations clés, stage recherché et disponibilité."
            value={personalInfo.summary}
            onChange={handleChange('summary')}
            helperText={`${stripInlineMarkup(personalInfo.summary).length} caractères · idéal : 3 à 5 lignes (250 à 550 caractères). Sélectionnez un mot puis « Gras » pour le mettre en avant (3 à 6 mots-clés suffisent).`}
            inputProps={{ maxLength: 900 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
