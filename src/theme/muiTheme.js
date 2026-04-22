import { createTheme, alpha } from '@mui/material/styles';
import { tokens } from './tokens';

const { colors, typography: typo, borderRadius, shadows } = tokens;

export function createAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        light:        colors.primary[300],
        main:         colors.primary[900],
        dark:         colors.primary[900],
        contrastText: '#ffffff',
      },
      secondary: {
        light:        colors.secondary[300],
        main:         colors.secondary[600],
        dark:         colors.secondary[800],
        contrastText: '#000000',
      },
      background: {
        default: isDark ? '#0f1117' : colors.neutral[50],
        paper:   isDark ? '#1a1d27' : '#ffffff',
      },
      text: {
        primary:   isDark ? '#e8eaf6' : colors.neutral[900],
        secondary: isDark ? '#9fa8da' : colors.neutral[600],
        disabled:  isDark ? '#4a5568' : colors.neutral[400],
      },
      divider: isDark ? 'rgba(121,134,203,0.15)' : colors.neutral[200],
      success: { main: colors.success },
      warning: { main: colors.warning },
      error:   { main: colors.error },
      info:    { main: colors.info },
    },

    typography: {
      fontFamily: typo.fontFamily.ui,
      h1: {
        fontFamily: typo.fontFamily.display,
        fontWeight: typo.weights.bold,
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: typo.fontFamily.display,
        fontWeight: typo.weights.semibold,
        fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontFamily: typo.fontFamily.ui,
        fontWeight: typo.weights.semibold,
        fontSize: 'clamp(1.2rem, 2.5vw, 1.75rem)',
        lineHeight: 1.3,
      },
      h4: { fontFamily: typo.fontFamily.ui, fontWeight: typo.weights.semibold, fontSize: '1.25rem', lineHeight: 1.4 },
      h5: { fontFamily: typo.fontFamily.ui, fontWeight: typo.weights.medium, fontSize: '1.1rem', lineHeight: 1.4 },
      h6: { fontFamily: typo.fontFamily.ui, fontWeight: typo.weights.medium, fontSize: '1rem', lineHeight: 1.5 },
      subtitle1: { fontSize: '1rem', fontWeight: typo.weights.medium, lineHeight: 1.5, letterSpacing: '0.01em' },
      subtitle2: { fontSize: '0.875rem', fontWeight: typo.weights.medium, lineHeight: 1.5 },
      body1: { fontSize: '1rem', fontWeight: typo.weights.regular, lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', fontWeight: typo.weights.regular, lineHeight: 1.6 },
      caption: { fontSize: '0.75rem', lineHeight: 1.5, letterSpacing: '0.03em' },
      overline: { fontSize: '0.7rem', fontWeight: typo.weights.semibold, letterSpacing: '0.12em', textTransform: 'uppercase' },
      button: { fontWeight: typo.weights.semibold, letterSpacing: '0.03em', textTransform: 'none' },
    },

    shape: { borderRadius: borderRadius.md },
    spacing: 8,
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box' },
          html: { scrollBehavior: 'smooth', WebkitFontSmoothing: 'antialiased' },
          body: { overflowX: 'hidden' },
          '::-webkit-scrollbar': { width: '6px', height: '6px' },
          '::-webkit-scrollbar-track': { background: isDark ? '#1a1d27' : colors.neutral[100] },
          '::-webkit-scrollbar-thumb': {
            background: isDark ? colors.primary[700] : colors.primary[300],
            borderRadius: '99px',
          },
          '::-webkit-scrollbar-thumb:hover': { background: colors.primary[500] },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: borderRadius.md,
            padding: '10px 24px',
            fontSize: '0.9rem',
            fontWeight: typo.weights.semibold,
            transition: 'all 0.2s ease',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[900]} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[800]} 100%)`,
              transform: 'translateY(-1px)',
              boxShadow: shadows.fab,
            },
          },
          outlinedPrimary: {
            borderWidth: '2px',
            '&:hover': { borderWidth: '2px', backgroundColor: alpha(colors.primary[900], 0.06) },
          },
          sizeLarge: { padding: '14px 32px', fontSize: '1rem' },
          sizeSmall: { padding: '6px 16px', fontSize: '0.8125rem' },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid`,
            borderColor: isDark ? 'rgba(121,134,203,0.15)' : colors.neutral[200],
            borderRadius: borderRadius.lg,
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : shadows.card,
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            backgroundColor: isDark ? '#1a1d27' : '#ffffff',
          },
        },
      },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: borderRadius.lg },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: borderRadius.md,
              transition: 'box-shadow 0.2s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary[400] },
              '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(colors.primary[900], 0.12)}` },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary[900], borderWidth: '2px' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: colors.primary[isDark ? 300 : 900] },
          },
        },
      },

      MuiChip: {
        styleOverrides: { root: { borderRadius: borderRadius.sm, fontWeight: typo.weights.medium } },
      },

      MuiTab: {
        styleOverrides: {
          root: { fontWeight: typo.weights.medium, fontSize: '0.875rem', textTransform: 'none', minWidth: 'auto', padding: '10px 16px' },
        },
      },

      MuiTabs: {
        styleOverrides: { indicator: { height: '3px', borderRadius: '3px 3px 0 0' } },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: isDark ? '#2d3748' : colors.neutral[800], borderRadius: borderRadius.sm, fontSize: '0.75rem' },
          arrow: { color: isDark ? '#2d3748' : colors.neutral[800] },
        },
      },

      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: borderRadius.full, height: '6px' }, bar: { borderRadius: borderRadius.full } },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark ? '0 1px 0 rgba(121,134,203,0.15)' : shadows.navbar,
            borderBottom: `1px solid ${isDark ? 'rgba(121,134,203,0.15)' : colors.neutral[200]}`,
            backgroundColor: isDark ? '#1a1d27' : '#ffffff',
            color: isDark ? '#e8eaf6' : colors.neutral[900],
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: `1px solid ${isDark ? 'rgba(121,134,203,0.15)' : colors.neutral[200]}` },
        },
      },

      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? 'rgba(121,134,203,0.15)' : colors.neutral[200]}`,
            borderRadius: `${borderRadius.md}px !important`,
            marginBottom: '8px',
            '&:before': { display: 'none' },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.15s ease, transform 0.15s ease',
            '&:hover': { transform: 'scale(1.05)' },
          },
        },
      },
    },
  });
}

export default createAppTheme('light');
