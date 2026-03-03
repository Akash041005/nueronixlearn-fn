import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  alpha, useTheme, ToggleButton, ToggleButtonGroup, InputAdornment, IconButton
} from '@mui/material';
import { ArrowForward, School, Person, Visibility, VisibilityOff, PhoneAndroid } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const ACCENT = '#00FF88';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role, phone);
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
        description="Join NeuronixLearn for free. Start your AI-powered personalized learning journey today."
        url="/register"
        noindex={false}
      />
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flex: 1, flexDirection: 'column', justifyContent: 'space-between',
        p: 8,
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'relative', overflow: 'hidden',
        background: isDark 
          ? `linear-gradient(135deg, ${alpha('#0a0a0f', 0.95)} 0%, ${alpha('#1a1a2e', 0.9)} 100%)`
          : `linear-gradient(135deg, ${alpha('#f8f9ff', 0.95)} 0%, ${alpha('#eef0f5', 0.9)} 100%)`,
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(ellipse 80% 70% at 0% 0%, ${alpha(ACCENT, isDark ? 0.25 : 0.15)} 0%, transparent 60%)`,
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            width: 40, height: 40, borderRadius: '10px', 
            background: `linear-gradient(135deg, ${ACCENT} 0%, #4DFFA3 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${alpha(ACCENT, 0.4)}`
          }}>
            <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>NL</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>NeuronixLearn</Typography>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontSize: '2.8rem', mb: 3, maxWidth: 400,
            background: `linear-gradient(135deg, ${isDark ? '#fff' : '#1a1a2e'} 0%, ${ACCENT} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Join NeuronixLearn
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: '🎯', title: 'AI-powered learning paths' },
              { icon: '🔒', title: 'Secure & private' }
            ].map((item) => (
              <Box key={item.title} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                <Typography color="text.secondary">{item.title}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">© 2025 NeuronixLearn</Typography>
      </Box>

      <Box sx={{ flex: { xs: 1, lg: '0 0 520px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 4, md: 8 } }}>
        <Box sx={{ maxWidth: 420, width: '100%', mx: 'auto' }}>
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 4, alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: ACCENT }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#fff', textAlign: 'center', mt: 0.5 }}>NL</Typography>
            </Box>
            <Typography fontWeight={700}>NeuronixLearn</Typography>
          </Box>

          <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>Create your account</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Start learning today</Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Full name" value={name} onChange={(e) => setName(e.target.value)} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              <TextField fullWidth label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              <TextField fullWidth label="Phone (with country code)" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                InputProps={{
                  startAdornment: <PhoneAndroid sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                }}
              />
              <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                helperText="At least 6 characters"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Box>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'text.secondary' }}>I want to:</Typography>
                <ToggleButtonGroup value={role} exclusive onChange={(_, val) => val && setRole(val)} fullWidth
                  sx={{ '& .MuiToggleButton-root': { py: 1.5, borderRadius: '10px !important' } }}>
                  <ToggleButton value="student"><School sx={{ mr: 1 }} /> Learn</ToggleButton>
                  <ToggleButton value="teacher"><Person sx={{ mr: 1 }} /> Teach</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Button fullWidth variant="contained" type="submit" size="large" disabled={loading}
                sx={{ py: 1.5, borderRadius: '10px', fontWeight: 600, boxShadow: `0 4px 20px ${alpha(ACCENT, 0.3)}` }}>
                {loading ? <CircularProgress size={20} /> : 'Create Account'}
              </Button>
            </Box>
          </form>

          <Typography sx={{ mt: 3, textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: ACCENT, fontWeight: 600 }}>Sign in</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
