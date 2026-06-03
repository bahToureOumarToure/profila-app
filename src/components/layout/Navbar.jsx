import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, Divider,
  Typography, useScrollTrigger, Slide, useTheme, useMediaQuery, Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAppTheme } from '@context/ThemeContext';

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger({ threshold: 80 });
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { mode, toggleMode } = useAppTheme();
  const isDark = mode === 'dark';

  const isBuilder = location.pathname === '/builder';

  const NAV_LINKS = [
    { label: 'Accueil',      to: '/' },
    { label: 'Créer mon CV', to: '/builder' },
  ];

  return (
    <>
      <HideOnScroll>
        <AppBar position="fixed" color="default">
          <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 4 } }}>
            {/* Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                textDecoration: 'none', color: 'inherit', flexGrow: { xs: 1, md: 0 },
              }}
            >
              <Box
                component="img"
                src="/icone_perso/profila.png"
                alt="Logo Profila"
                sx={{ width: 34, height: 34, objectFit: 'contain' }}
              />
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: 'primary.main', letterSpacing: '-0.02em' }}
              >
                Profila
              </Typography>
            </Box>

            {/* Desktop nav */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                {!isBuilder && (
                  <Button component={RouterLink} to="/" color="inherit" size="small">
                    Accueil
                  </Button>
                )}
                <Button
                  component={RouterLink}
                  to="/builder"
                  variant="contained"
                  size="small"
                  sx={{ ml: 1 }}
                >
                  {isBuilder ? '← Accueil' : 'Créer mon CV'}
                </Button>

                {/* Dark/Light toggle */}
                <Tooltip title={isDark ? 'Mode clair' : 'Mode sombre'} arrow>
                  <IconButton onClick={toggleMode} size="small" sx={{ ml: 1 }}>
                    {isDark
                      ? <LightModeOutlinedIcon fontSize="small" />
                      : <DarkModeOutlinedIcon fontSize="small" />
                    }
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Mobile: theme toggle + hamburger */}
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title={isDark ? 'Mode clair' : 'Mode sombre'} arrow>
                  <IconButton onClick={toggleMode} size="small">
                    {isDark
                      ? <LightModeOutlinedIcon fontSize="small" />
                      : <DarkModeOutlinedIcon fontSize="small" />
                    }
                  </IconButton>
                </Tooltip>
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  aria-label="Ouvrir le menu"
                  edge="end"
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Spacer */}
      <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }} />

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="img" src="/icone_perso/profila.png" alt="Logo Profila" sx={{ width: 28, height: 28, objectFit: 'contain' }} />
            <Typography variant="h6" fontWeight={700} color="primary">Profila</Typography>
          </Box>
          <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.to} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                selected={location.pathname === link.to}
                sx={{ borderRadius: 2, mx: 1, mb: 0.5 }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
