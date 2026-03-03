import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

const GREEN_ACCENT = '#00FF88';
const GREEN_LIGHT = '#4DFFA3';
const GREEN_DARK = '#00CC6A';
const GREEN_NEON = '#00FF94';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: GREEN_ACCENT,
      light: GREEN_LIGHT,
      dark: GREEN_DARK,
      contrastText: mode === 'dark' ? '#000000' : '#000000'
    },
    secondary: {
      main: mode === 'dark' ? '#1B5E20' : '#2E7D32',
      light: mode === 'dark' ? '#2E7D32' : '#4CAF50',
      dark: mode === 'dark' ? '#0D3D12' : '#1B5E20'
    },
    error: { main: '#FF4757' },
    warning: { main: '#FFBE0B' },
    info: { main: '#00D9FF' },
    success: { main: GREEN_ACCENT },
    ...(mode === 'dark'
      ? {
          background: { default: '#050A0D', paper: '#0A1117' },
          text: { primary: '#FFFFFF', secondary: '#8A9BA8' },
          divider: 'rgba(0, 255, 136, 0.1)'
        }
      : {
          background: { default: '#F5F7F9', paper: '#FFFFFF' },
          text: { primary: '#0D1117', secondary: '#5C6370' },
          divider: 'rgba(0, 0, 0, 0.08)'
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
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
          scrollbarWidth: 'thin',
          scrollbarColor: `${GREEN_ACCENT} #1a1a1a`,
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: mode === 'dark' ? '#0A1117' : '#f1f1f1' },
          '&::-webkit-scrollbar-thumb': { background: GREEN_ACCENT, borderRadius: '4px' }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          padding: '10px 22px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': { 
            boxShadow: mode === 'dark' ? `0 0 20px ${alpha(GREEN_ACCENT, 0.3)}` : 'none',
            transform: 'translateY(-2px)'
          },
          '&:active': { transform: 'translateY(0)' }
        }),
        contained: ({ theme }) => ({
          background: `linear-gradient(135deg, ${GREEN_ACCENT} 0%, ${GREEN_DARK} 100%)`,
          color: '#000',
          '&:hover': { 
            background: `linear-gradient(135deg, ${GREEN_LIGHT} 0%, ${GREEN_ACCENT} 100%)`,
            boxShadow: `0 0 25px ${alpha(GREEN_ACCENT, 0.4)}`
          }
        }),
        outlined: ({ theme }) => ({
          borderColor: GREEN_ACCENT,
          color: GREEN_ACCENT,
          '&:hover': {
            borderColor: GREEN_LIGHT,
            backgroundColor: alpha(GREEN_ACCENT, 0.08),
            boxShadow: `0 0 15px ${alpha(GREEN_ACCENT, 0.2)}`
          }
        }),
        text: ({ theme }) => ({
          color: mode === 'dark' ? '#fff' : '#0D1117',
          '&:hover': {
            backgroundColor: alpha(GREEN_ACCENT, 0.08)
          }
        })
      }
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          boxShadow: mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 255, 136, 0.05)' 
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          backgroundImage: 'none',
          background: mode === 'dark'
            ? 'linear-gradient(180deg, rgba(10, 17, 23, 0.9) 0%, rgba(5, 10, 13, 0.95) 100%)'
            : '#FFFFFF',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 255, 136, 0.15)'
              : '0 8px 30px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)'
          }
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          background: mode === 'dark'
            ? 'linear-gradient(180deg, rgba(10, 17, 23, 0.95) 0%, rgba(5, 10, 13, 0.98) 100%)'
            : '#FFFFFF'
        })
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          background: mode === 'dark'
            ? 'rgba(5, 10, 13, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
        })
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: mode === 'dark' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            },
            '&:hover fieldset': { borderColor: GREEN_ACCENT },
            '&.Mui-focused fieldset': { 
              borderColor: GREEN_ACCENT, 
              borderWidth: 2,
              boxShadow: `0 0 10px ${alpha(GREEN_ACCENT, 0.15)}`
            }
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: GREEN_ACCENT,
            fontWeight: 600
          }
        })
      }
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.01em',
          border: `1px solid ${mode === 'dark' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
          backgroundColor: mode === 'dark'
            ? 'rgba(0, 255, 136, 0.08)'
            : 'rgba(0, 0, 0, 0.04)'
        }),
        colorPrimary: {
          backgroundColor: alpha(GREEN_ACCENT, 0.15),
          color: GREEN_LIGHT,
          border: `1px solid ${alpha(GREEN_ACCENT, 0.3)}`
        },
        colorSuccess: ({ theme }) => ({
          backgroundColor: alpha(GREEN_ACCENT, 0.15),
          color: GREEN_ACCENT,
          border: `1px solid ${alpha(GREEN_ACCENT, 0.3)}`
        }),
        colorWarning: ({ theme }) => ({
          backgroundColor: alpha('#FFBE0B', 0.15),
          color: '#FFBE0B',
          border: `1px solid ${alpha('#FFBE0B', 0.3)}`
        }),
        colorError: ({ theme }) => ({
          backgroundColor: alpha('#FF4757', 0.15),
          color: '#FF4757',
          border: `1px solid ${alpha('#FF4757', 0.3)}`
        })
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 16,
          border: `1px solid ${mode === 'dark' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
          background: mode === 'dark'
            ? 'linear-gradient(180deg, #0A1117 0%, #050A0D 100%)'
            : '#FFFFFF',
          boxShadow: mode === 'dark'
            ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 255, 136, 0.05)'
            : '0 20px 60px rgba(0, 0, 0, 0.2)'
        })
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          height: 6,
          backgroundColor: mode === 'dark'
            ? 'rgba(0, 255, 136, 0.1)'
            : 'rgba(0, 0, 0, 0.08)'
        }),
        bar: { 
          borderRadius: 4, 
          background: `linear-gradient(90deg, ${GREEN_DARK} 0%, ${GREEN_ACCENT} 100%)`
        }
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
          color: mode === 'dark' ? GREEN_ACCENT : '#2E7D32',
          borderColor: mode === 'dark' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          backgroundColor: mode === 'dark' ? 'rgba(0, 255, 136, 0.03)' : 'rgba(0, 0, 0, 0.02)'
        }),
        body: ({ theme }) => ({
          borderColor: mode === 'dark' ? 'rgba(0, 255, 136, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        })
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor: mode === 'dark'
              ? 'rgba(0, 255, 136, 0.04)'
              : 'rgba(0, 0, 0, 0.02)'
          }
        })
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 10,
          border: `1px solid ${mode === 'dark' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: mode === 'dark'
            ? '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0, 255, 136, 0.05)'
            : '0 10px 40px rgba(0,0,0,0.15)',
          background: mode === 'dark'
            ? 'linear-gradient(180deg, #0A1117 0%, #050A0D 100%)'
            : '#FFFFFF'
        })
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          borderRadius: 6,
          margin: '2px 6px',
          padding: '8px 14px',
          '&:hover': {
            backgroundColor: alpha(GREEN_ACCENT, 0.1)
          },
          '&.Mui-selected': {
            backgroundColor: alpha(GREEN_ACCENT, 0.15),
            '&:hover': {
              backgroundColor: alpha(GREEN_ACCENT, 0.2)
            }
          }
        })
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          borderRadius: 6,
          fontSize: '0.78rem',
          fontWeight: 500,
          backgroundColor: mode === 'dark' ? '#0A1117' : '#1a1a1a',
          border: `1px solid ${mode === 'dark' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 255, 136, 0.1)'
            : '0 4px 20px rgba(0, 0, 0, 0.15)'
        })
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: mode === 'dark' ? '#8A9BA8' : '#5C6370',
            '&.Mui-selected': {
              color: GREEN_ACCENT
            }
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: `linear-gradient(90deg, ${GREEN_DARK} 0%, ${GREEN_ACCENT} 100%)`,
            boxShadow: `0 0 10px ${alpha(GREEN_ACCENT, 0.5)}`
          }
        })
      }
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.2s ease',
          '&:hover': {
            color: GREEN_ACCENT,
            backgroundColor: alpha(GREEN_ACCENT, 0.05)
          }
        })
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(GREEN_ACCENT, 0.1),
            color: GREEN_ACCENT,
            transform: 'scale(1.05)'
          }
        })
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: `linear-gradient(135deg, ${GREEN_DARK} 0%, ${GREEN_ACCENT} 100%)`,
          color: '#000',
          fontWeight: 600
        })
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 0, 0, 0.15)'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: GREEN_ACCENT
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: GREEN_ACCENT
          }
        })
      }
    }
  }
});

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));
export default createAppTheme('dark');

export const GREEN_ACCENT_COLOR = GREEN_ACCENT;
export const GREEN_LIGHT_COLOR = GREEN_LIGHT;
export const GREEN_DARK_COLOR = GREEN_DARK;
