import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, alpha, useTheme } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const ACCENT = '#7C6EE8';

const STATS = [
  { value: '50K+', label: 'Active learners' },
  { value: '200+', label: 'Courses' },
  { value: '95%', label: 'Completion rate' },
  { value: '4.9★', label: 'Average rating' },
];

const FEATURES = [
  {
    num: '01',
    title: 'AI-Powered Personalization',
    desc: 'Your learning path adapts in real-time based on cognitive load, performance patterns, and personal goals.'
  },
  {
    num: '02',
    title: 'Adaptive Difficulty',
    desc: 'Content difficulty shifts automatically — never too easy to be boring, never too hard to overwhelm.'
  },
  {
    num: '03',
    title: 'Deep Analytics',
    desc: 'Track every metric that matters: time-on-task, retention rates, weak topics, and streak consistency.'
  },
];

const Landing = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "EducationWebApp",
      "name": "NueronixLearn",
      "description": "AI-Powered Adaptive Learning Platform that personalizes education based on individual learning patterns",
      "url": "https://nueronixlearn.com",
      "applicationCategory": "EducationApplication",
      "operatingSystem": "Web Browser, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "50000"
      },
      "author": {
        "@type": "Organization",
        "name": "NueronixLearn"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 10, md: 16 },
        pb: { xs: 8, md: 14 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: isDark
            ? `radial-gradient(ellipse 80% 60% at 50% -10%, ${alpha(ACCENT, 0.18)} 0%, transparent 70%)`
            : `radial-gradient(ellipse 80% 60% at 50% -10%, ${alpha(ACCENT, 0.1)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }
      }}>
        {/* Grid lines overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: isDark
            ? `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          {/* Badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.5, mb: 5,
            border: `1px solid ${alpha(ACCENT, 0.35)}`,
            borderRadius: '20px',
            bgcolor: alpha(ACCENT, 0.08)
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT }} />
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', color: ACCENT, textTransform: 'uppercase' }}>
              AI-Powered Learning Platform
            </Typography>
          </Box>

          {/* Headline */}
          <Typography variant="h1" sx={{
            fontSize: { xs: '2.8rem', sm: '4rem', md: '5.5rem' },
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 800,
            mb: 3,
            color: 'text.primary'
          }}>
            Learn smarter.<br />
            <Box component="span" sx={{ color: ACCENT }}>Not harder.</Box>
          </Typography>

          <Typography sx={{
            fontSize: { xs: '1rem', md: '1.15rem' },
            color: 'text.secondary',
            maxWidth: 520,
            lineHeight: 1.7,
            mb: 5
          }}>
            NeuroLearn adapts to how your brain actually works — serving the right content at the right difficulty, at exactly the right moment.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: { xs: 8, md: 12 } }}>
            <Button
              component={Link} to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ px: 3, py: 1.25, fontSize: '0.9rem' }}
            >
              Start for free
            </Button>
            <Button
              component={Link} to="/courses"
              variant="outlined"
              size="large"
              sx={{ px: 3, py: 1.25, fontSize: '0.9rem' }}
            >
              Browse courses
            </Button>
          </Box>

          {/* Stats row */}
          <Box sx={{
            display: 'flex', gap: { xs: 4, md: 8 },
            flexWrap: 'wrap',
            pt: 5,
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            {STATS.map((s) => (
              <Box key={s.label}>
                <Typography sx={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: { xs: '1.6rem', md: '2rem' },
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'text.primary'
                }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.25 }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: { xs: 8, md: 14 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 8, maxWidth: 520 }}>
            <Typography variant="overline" sx={{ color: ACCENT, mb: 1, display: 'block' }}>
              Why NeuroLearn
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, mb: 2 }}>
              Built around how you learn
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
              Most platforms deliver content. We deliver understanding — through a system that reads your progress and adjusts automatically.
            </Typography>
          </Box>

          <Box>
            {FEATURES.map((f, i) => (
              <Box
                key={f.num}
                sx={{
                  display: 'flex', gap: { xs: 3, md: 6 },
                  py: { xs: 4, md: 5 },
                  borderTop: i === 0 ? `1px solid ${theme.palette.divider}` : 'none',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  alignItems: 'flex-start',
                  '&:hover .feature-num': { color: ACCENT },
                  transition: 'all 0.15s ease'
                }}
              >
                <Typography
                  className="feature-num"
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    fontWeight: 700,
                    color: 'text.secondary',
                    letterSpacing: '-0.01em',
                    minWidth: 32,
                    pt: 0.25,
                    transition: 'color 0.15s ease'
                  }}
                >
                  {f.num}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600 }}>{f.title}</Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 600 }}>{f.desc}</Typography>
                </Box>
                <ArrowForward sx={{
                  fontSize: 18, color: 'text.secondary', mt: 0.75,
                  display: { xs: 'none', md: 'block' },
                  flexShrink: 0
                }} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            letterSpacing: '-0.025em',
            mb: 3
          }}>
            Ready to learn differently?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 5, fontSize: '1.05rem' }}>
            Join thousands of students and teachers already using NeuroLearn.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={Link} to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ px: 4, py: 1.25 }}
            >
              Create free account
            </Button>
            <Button component={Link} to="/login" variant="outlined" size="large" sx={{ px: 3, py: 1.25 }}>
              Log in
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default Landing;
