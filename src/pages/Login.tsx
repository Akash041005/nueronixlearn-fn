import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  alpha, useTheme
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const ACCENT = '#7C6EE8';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!data.user.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate(data.user.role === 'teacher' ? '/teacher' : '/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <SEO 
        title="Login"
        description="Sign in to your NueronixLearn account and continue your AI-powered learning journey."
        url="/login"
        noindex={false}
      />
      {/* Left panel — branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1, flexDirection: 'column', justifyContent: 'space-between',
        p: 6,
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(ellipse 80% 70% at 0% 100%, ${alpha(ACCENT, isDark ? 0.18 : 0.1)} 0%, transparent 60%)`,
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '7px', bgcolor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>NL</Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 600, fontSize: '1rem' }}>NueronixLearn</Typography>
        </Box>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '2.4rem', mb: 2, maxWidth: 380, letterSpacing: '-0.02em' }}>
            Your AI learning partner.
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 340 }}>
            Adaptive paths. Real insights. A platform that learns alongside you.
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">© 2025 NueronixLearn</Typography>
      </Box>

      {/* Right panel — form */}
      <Box sx={{
        flex: { xs: 1, md: '0 0 440px' },
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        p: { xs: 3, md: 6 }
      }}>
        <Box sx={{ maxWidth: 360, width: '100%', mx: 'auto' }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: '0.72rem', color: '#fff' }}>NL</Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 600, fontSize: '0.95rem' }}>NueronixLearn</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 0.75, fontWeight: 600, letterSpacing: '-0.015em' }}>
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, fontSize: '0.9rem' }}>
            Sign in to your account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '6px', fontSize: '0.85rem' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth label="Email" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                autoComplete="email"
              />
              <TextField
                fullWidth label="Password" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
                autoComplete="current-password"
              />
              <Button
                fullWidth variant="contained" type="submit" size="large"
                disabled={loading} endIcon={!loading && <ArrowForward />}
                sx={{ mt: 1, py: 1.25 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Sign in'}
              </Button>
            </Box>
          </form>

          <Typography sx={{ mt: 4, fontSize: '0.85rem', color: 'text.secondary', textAlign: 'center' }}>
            No account?{' '}
            <Link to="/register" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>
              Create one free
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
