import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffffff' }, /* white */
    secondary: { main: '#d4d4d8' }, /* gray-300 */
    error: { main: '#f87171' },
    success: { main: '#f4f4f5' }, /* gray-100 */
    warning: { main: '#fbbf24' },
    background: { default: '#070b14', paper: 'rgba(255,255,255,0.035)' },
    text: { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.45)' },
    divider: 'rgba(255,255,255,0.07)',
  },
  typography: {
    fontFamily: '"Poppins", system-ui, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    caption: { fontWeight: 500 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        * { box-sizing: border-box; }
        body { font-family: 'Poppins', system-ui, sans-serif !important; }
      `,
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.035)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          borderRadius: 20,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(10,14,28,0.95)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Poppins", system-ui, sans-serif',
          fontSize: '0.875rem',
          padding: '10px 22px',
          transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        },
        contained: {
          background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)',
          color: '#000000',
          boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f4f4f5 0%, #a1a1aa 100%)',
            boxShadow: '0 8px 28px rgba(255,255,255,0.25)',
            transform: 'translateY(-2px)',
          },
          '&:disabled': { opacity: 0.5 },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.35)',
          color: '#f4f4f5',
          '&:hover': { borderColor: '#ffffff', background: 'rgba(255,255,255,0.08)' },
        },
        text: {
          color: 'rgba(255,255,255,0.55)',
          '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.06)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            fontFamily: '"Poppins", system-ui, sans-serif',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.09)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
            '&.Mui-focused fieldset': { borderColor: '#ffffff', borderWidth: '1.5px' },
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.35)', fontFamily: '"Poppins", system-ui, sans-serif' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
          '& .MuiFormHelperText-root': { fontFamily: '"Poppins", system-ui, sans-serif' },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(7,11,20,0.97)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(7,11,20,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10, transition: 'all 0.2s ease' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontFamily: '"Poppins", system-ui, sans-serif' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 12, transition: 'all 0.2s ease' },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: 'rgba(20,25,50,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Poppins", system-ui, sans-serif',
          fontWeight: 500,
          fontSize: '0.75rem',
          borderRadius: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.06)' },
      },
    },
  },
});

export default theme;
