import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem,
  Avatar, Divider, alpha
} from '@mui/material';
import {
  Menu as MenuIcon, LightMode, DarkMode, KeyboardArrowDown, Logout, Person, Dashboard
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#7C6EE8';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => { setAnchorEl(null); setMobileAnchorEl(null); };
  const handleLogout = () => { logout(); navigate('/'); handleClose(); };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = user ? [
    { label: 'Dashboard', path: user.role === 'teacher' ? '/teacher' : '/dashboard' },
    { label: 'Courses', path: '/courses' },
    ...(user.role === 'student' ? [
      { label: 'My Courses', path: '/my-courses' },
      { label: 'Study Plan', path: '/study-plan' },
      { label: 'Exams', path: '/exams' },
      { label: 'Diary', path: '/diary' },
    ] : []),
    ...(user.role === 'teacher' ? [
      { label: 'My Exams', path: '/teacher/exams' },
      { label: 'Create', path: '/teacher/create-course' },
    ] : []),
  ] : [
    { label: 'Courses', path: '/courses' },
  ];

  const mobileLinks = user ? navLinks : [
    { label: 'Courses', path: '/courses' },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ];

  const isDark = mode === 'dark';

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          maxWidth: 1280,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, md: 4 },
          minHeight: '60px !important',
          gap: 2
        }}
      >
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
            flexShrink: 0
          }}
        >
          <Box sx={{
            width: 28, height: 28,
            borderRadius: '6px',
            background: ACCENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Typography sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700, fontSize: '0.75rem', color: '#fff', lineHeight: 1
            }}>NL</Typography>
          </Box>
          <Typography sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: '0.95rem',
            letterSpacing: '-0.01em',
            color: 'text.primary',
            display: { xs: 'none', sm: 'block' }
          }}>
            NeuronixLearn
          </Typography>
        </Box>

        {/* Desktop nav */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, ml: 2, flex: 1 }}>
          {navLinks.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                fontSize: '0.82rem',
                fontWeight: 500,
                color: isActive(item.path) ? 'text.primary' : 'text.secondary',
                px: 1.5, py: 0.75,
                borderRadius: '5px',
                position: 'relative',
                '&::after': isActive(item.path) ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 14,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: ACCENT
                } : {},
                '&:hover': { color: 'text.primary', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          {/* Theme toggle */}
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              color: 'text.secondary',
              width: 32, height: 32,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '6px',
              '&:hover': { color: 'text.primary', borderColor: alpha(ACCENT, 0.5) }
            }}
          >
            {isDark ? <LightMode sx={{ fontSize: 16 }} /> : <DarkMode sx={{ fontSize: 16 }} />}
          </IconButton>

          {user ? (
            <>
              <Box
                onClick={handleMenu}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  cursor: 'pointer', px: 1.5, py: 0.5,
                  border: '1px solid', borderColor: 'divider',
                  borderRadius: '6px',
                  '&:hover': { borderColor: alpha(ACCENT, 0.4), bgcolor: alpha(ACCENT, 0.04) },
                  transition: 'all 0.15s ease'
                }}
              >
                <Avatar
                  src={user.avatar}
                  sx={{ width: 22, height: 22, bgcolor: ACCENT, fontSize: '0.65rem', fontWeight: 700 }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                  {user.name.split(' ')[0]}
                </Typography>
                <KeyboardArrowDown sx={{ fontSize: 14, color: 'text.secondary' }} />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { mt: 0.5, minWidth: 180 } }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', letterSpacing: '0.06em' }}>
                    {user.role}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem component={Link} to="/profile" onClick={handleClose} sx={{ gap: 1.5 }}>
                  <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography fontSize="0.85rem">Profile</Typography>
                </MenuItem>
                <MenuItem component={Link} to={user.role === 'teacher' ? '/teacher' : '/dashboard'} onClick={handleClose} sx={{ gap: 1.5 }}>
                  <Dashboard sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography fontSize="0.85rem">Dashboard</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: 'error.main' }}>
                  <Logout sx={{ fontSize: 16 }} />
                  <Typography fontSize="0.85rem">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button component={Link} to="/login" size="small" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                Log in
              </Button>
              <Button component={Link} to="/register" variant="contained" size="small" sx={{ fontSize: '0.82rem' }}>
                Get started
              </Button>
            </Box>
          )}

          {/* Mobile menu button */}
          <IconButton
            sx={{ display: { md: 'none' }, color: 'text.secondary', width: 32, height: 32, borderRadius: '6px' }}
            onClick={(e) => setMobileAnchorEl(e.currentTarget)}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Mobile menu */}
        <Menu
          anchorEl={mobileAnchorEl}
          open={Boolean(mobileAnchorEl)}
          onClose={handleClose}
          PaperProps={{ sx: { width: 240, mt: 0.5 } }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {mobileLinks.map((item) => (
            <MenuItem key={item.path} component={Link} to={item.path} onClick={handleClose}>
              <Typography fontSize="0.875rem">{item.label}</Typography>
            </MenuItem>
          ))}
          {user && [
            <Divider key="div" />,
            <MenuItem key="logout" onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Typography fontSize="0.875rem">Logout</Typography>
            </MenuItem>
          ]}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
