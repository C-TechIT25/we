import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3673FC' },
    secondary: { main: '#64748b' },
    error: { main: '#dc2626' },
    success: { main: '#15803d' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#172033', secondary: '#64748b' },
    divider: '#e8ecf2',
  },
  typography: {
    fontFamily: '"Poppins", system-ui, sans-serif',
    h3: { fontWeight: 700, letterSpacing: '-0.03em' },
    h4: { fontWeight: 700, letterSpacing: '-0.03em', fontSize: '1.85rem' },
    h5: { fontWeight: 700 }, h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: {
      background: '#ffffff', border: '1px solid #e8ecf2', borderRadius: 18,
      boxShadow: '0 4px 20px rgba(23,32,51,0.04)',
    } } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20, boxShadow: '0 24px 80px rgba(23,32,51,0.16)' } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: {
      root: { borderRadius: 10, padding: '10px 20px', transition: 'background 0.2s, box-shadow 0.2s' },
      containedPrimary: { '&:hover': { boxShadow: '0 4px 14px rgba(54,115,252,0.18)' } },
      outlined: { borderColor: '#d8ddea' },
    } },
    MuiOutlinedInput: { styleOverrides: { root: {
      background: '#ffffff', borderRadius: 10,
      '& fieldset': { borderColor: '#dce2eb' },
      '&:hover fieldset': { borderColor: '#94a3b8' },
    } } },
    MuiDrawer: { styleOverrides: { paper: { background: '#f8f9fc', borderRight: '1px solid #e8ecf2' } } },
    MuiAppBar: { styleOverrides: { root: {
      color: '#172033', background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(16px)', boxShadow: 'none', borderBottom: '1px solid #e8ecf2',
    } } },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 9 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 7, fontWeight: 500 } } },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: '#edf0f5' } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, background: '#172033' } } },
  },
});

export default theme;
