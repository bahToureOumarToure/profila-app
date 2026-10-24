import { useRef } from 'react';
import {
  Grid, TextField, Box, Avatar, Button, Typography, IconButton, Tooltip,
} from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCV } from '@context/CVContext';
import { getInitials } from '@utils/cvHelpers';
import { tokens } from '@theme/tokens';

export default function PersonalInfoSection() {
  const { cvData, updatePersonalInfo } = useCV();
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
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Profil professionnel"
            placeholder="Niveau d'études et spécialité, domaines techniques, réalisations clés, stage recherché et disponibilité."
            value={personalInfo.summary}
            onChange={handleChange('summary')}
            helperText={`${personalInfo.summary.length} caractères · idéal : 3 à 5 lignes (250 à 550 caractères). **gras** pour un mot-clé.`}
            inputProps={{ maxLength: 900 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
