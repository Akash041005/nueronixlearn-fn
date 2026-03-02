import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

// Design tokens
const ACCENT = '#7C6EE8';
const ACCENT_LIGHT = '#9B90EF';
const ACCENT_DARK = '#5B4EC7';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: ACCENT,
      light: ACCENT_LIGHT,
      dark: ACCENT_DARK,
      contrastText: '#ffffff'
    },
    secondary: {
      main: mode === 'dark' ? '#30D5A0' : '#16A37A',
      light: '#4DEDB8',
      dark: '#0E9A6E'
    },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#3B82F6' },
    success: { main: '#22C55E' },
    ...(mode === 'dark'
      ? {
        background: { default: '#080C10', paper: '#0E1318' },
        text: { primary: '#F0F0F0', secondary: '#7A8394' },
        divider: 'rgba(255,255,255,0.07)'
      }
      : {
        background: { default: '#FAFAFA', paper: '#FFFFFF' },
        text: { primary: '#0D0D0D', secondary: '#5C6370' },
        divider: 'rgba(0,0,0,0.08)'
      })
  },
  typography: {
    fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 },
    h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25 },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '-0.005em' },
    subtitle1: { fontWeight: 500, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' as const, fontSize: '0.7rem' },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: 'none' as const, fontWeight: 500, letterSpacing: '0.01em' },
    overline: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '0.12em', fontSize: '0.65rem' }
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          padding: '9px 20px',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.15s ease',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' }
        }),
        contained: ({ theme }) => ({
          background: ACCENT,
          color: '#fff',
          '&:hover': { background: ACCENT_DARK }
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(0,0,0,0.15)',
          '&:hover': {
            borderColor: ACCENT,
            backgroundColor: alpha(ACCENT, 0.06)
          }
        }),
        text: ({ theme }) => ({
          '&:hover': {
            backgroundColor: alpha(ACCENT, 0.06)
          }
        })
      }
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`
        })
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(8,12,16,0.92)'
            : 'rgba(250,250,250,0.92)'
        })
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            fontSize: '0.9rem',
            transition: 'all 0.15s ease',
            '& fieldset': {
              borderColor: theme.palette.divider,
              transition: 'border-color 0.15s ease'
            },
            '&:hover fieldset': { borderColor: alpha(ACCENT, 0.5) },
            '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: 1.5 }
          },
          '& .MuiInputLabel-root.Mui-focused': { color: ACCENT }
        })
      }
    },
    MuiSelect: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          borderRadius: 6
        })
      }
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          fontWeight: 500,
          fontSize: '0.75rem',
          letterSpacing: '0.01em',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.04)'
        }),
        colorPrimary: {
          backgroundColor: alpha(ACCENT, 0.12),
          color: ACCENT_LIGHT,
          border: `1px solid ${alpha(ACCENT, 0.25)}`
        },
        colorSuccess: ({ theme }) => ({
          backgroundColor: alpha('#22C55E', 0.1),
          color: '#22C55E',
          border: `1px solid ${alpha('#22C55E', 0.2)}`
        }),
        colorWarning: ({ theme }) => ({
          backgroundColor: alpha('#F59E0B', 0.1),
          color: '#F59E0B',
          border: `1px solid ${alpha('#F59E0B', 0.2)}`
        }),
        colorError: ({ theme }) => ({
          backgroundColor: alpha('#EF4444', 0.1),
          color: '#EF4444',
          border: `1px solid ${alpha('#EF4444', 0.2)}`
        })
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 10,
          border: `1px solid ${theme.palette.divider}`
        })
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider
        })
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 2,
          height: 3,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.08)'
        }),
        bar: { borderRadius: 2, backgroundColor: ACCENT }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          '&:before': { display: 'none' },
          borderRadius: '6px !important',
          marginBottom: 4
        })
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme.palette.text.secondary,
          borderColor: theme.palette.divider
        }),
        body: ({ theme }) => ({
          borderColor: theme.palette.divider
        })
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 8,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 40px rgba(0,0,0,0.6)'
            : '0 8px 40px rgba(0,0,0,0.12)'
        })
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          borderRadius: 4,
          margin: '0 4px',
          padding: '6px 12px',
          '&:hover': {
            backgroundColor: alpha(ACCENT, 0.08)
          }
        })
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          borderRadius: 4,
          fontSize: '0.78rem',
          fontWeight: 500,
          backgroundColor: theme.palette.mode === 'dark' ? '#1E2430' : '#1a1a1a',
          border: `1px solid ${theme.palette.divider}`
        })
      }
    }
  }
});

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));
export default createAppTheme('dark');
