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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Photo trop lourde (max 2 Mo)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updatePersonalInfo({ photo: ev.target.result });
    reader.readAsDataURL(file);
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
            JPG, PNG-max 2 Mo
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
          <TextField fullWidth label="Titre professionnel" placeholder="ex. Développeur Full Stack" value={personalInfo.title} onChange={handleChange('title')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Email" type="email" value={personalInfo.email} onChange={handleChange('email')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Téléphone" value={personalInfo.phone} onChange={handleChange('phone')} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Localisation" placeholder="ex. Paris, France" value={personalInfo.location} onChange={handleChange('location')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Site web" placeholder="https://..." value={personalInfo.website} onChange={handleChange('website')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="LinkedIn" placeholder="linkedin.com/in/..." value={personalInfo.linkedin} onChange={handleChange('linkedin')} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="GitHub" placeholder="github.com/..." value={personalInfo.github} onChange={handleChange('github')} />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Résumé professionnel"
            placeholder="Présentez-vous en quelques phrases percutantes..."
            value={personalInfo.summary}
            onChange={handleChange('summary')}
            helperText={`${personalInfo.summary.length}/500 caractères`}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
