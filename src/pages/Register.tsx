import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, alpha, useTheme
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const ACCENT = '#7C6EE8';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <SEO 
        title="Create Account"
        description="Join NueronixLearn for free. Start your AI-powered personalized learning journey today."
        url="/register"
        noindex={false}
      />
      {/* Left — branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1, flexDirection: 'column', justifyContent: 'space-between',
        p: 6,
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(ellipse 80% 70% at 0% 0%, ${alpha(ACCENT, isDark ? 0.18 : 0.1)} 0%, transparent 60%)`,
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
            Start learning the smarter way.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            {['Personalized AI learning paths', 'Adaptive difficulty in real-time', 'Deep progress analytics'].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: ACCENT, flexShrink: 0 }} />
                <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">© 2025 NueronixLearn</Typography>
      </Box>

      {/* Right — form */}
      <Box sx={{
        flex: { xs: 1, md: '0 0 480px' },
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        p: { xs: 3, md: 6 }
      }}>
        <Box sx={{ maxWidth: 380, width: '100%', mx: 'auto' }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 4, alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: '0.72rem', color: '#fff' }}>NL</Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 600, fontSize: '0.95rem' }}>NueronixLearn</Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 0.75, fontWeight: 600, letterSpacing: '-0.015em' }}>
            Create your account
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, fontSize: '0.9rem' }}>
            Free forever. No credit card required.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '6px', fontSize: '0.85rem' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="Full name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              <TextField
                fullWidth label="Password" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
                helperText="At least 6 characters"
                autoComplete="new-password"
              />
              <FormControl fullWidth>
                <InputLabel>I want to</InputLabel>
                <Select value={role} label="I want to" onChange={(e) => setRole(e.target.value)}>
                  <MenuItem value="student">Learn (Student)</MenuItem>
                  <MenuItem value="teacher">Teach (Teacher)</MenuItem>
                </Select>
              </FormControl>
              <Button
                fullWidth variant="contained" type="submit" size="large"
                disabled={loading} endIcon={!loading && <ArrowForward />}
                sx={{ mt: 1, py: 1.25 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Create free account'}
              </Button>
            </Box>
          </form>

          <Typography sx={{ mt: 4, fontSize: '0.85rem', color: 'text.secondary', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </Typography>

          <Typography sx={{ mt: 3, fontSize: '0.72rem', color: 'text.secondary', textAlign: 'center', lineHeight: 1.6 }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
