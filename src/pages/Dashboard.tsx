import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  CircularProgress, Chip, alpha, useTheme, Divider
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowForward, TrendingUp, Schedule, LocalFireDepartment, School } from '@mui/icons-material';
import { analyticsAPI, mlAPI } from '../services/api';

const ACCENT = '#00FF88';

const StatCard = ({ label, value, icon, sub }: any) => {
  const theme = useTheme();
  return (
    <Card sx={{ p: 0 }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
            {label}
          </Typography>
          <Box sx={{
            p: 0.75, borderRadius: '6px',
            bgcolor: alpha(ACCENT, 0.1),
            color: ACCENT, display: 'flex'
          }}>
            {icon}
          </Box>
        </Box>
        <Typography sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '2rem', fontWeight: 700,
          letterSpacing: '-0.025em', lineHeight: 1,
          color: 'text.primary', mb: 0.5
        }}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [dailyProgress, setDailyProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard().catch(() => ({ data: { stats: {}, recentActivity: [] } })),
      mlAPI.getRecommendations().catch(() => ({ data: { recommendations: null } })),
      analyticsAPI.getDailyProgress().catch(() => ({ data: { dailyProgress: [] } }))
    ]).then(([dashRes, recRes, progressRes]) => {
      setData(dashRes.data);
      setRecommendations(recRes.data.recommendations);
      setDailyProgress(progressRes.data.dailyProgress || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress size={28} />
    </Box>
  );

  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || [];
  const formatTime = (m: number) => { const h = Math.floor(m / 60); return h > 0 ? `${h}h ${m % 60}m` : `${m}m`; };

  const chartData = dailyProgress.length > 0 ? dailyProgress : [
    { name: 'Mon', progress: 0 }, { name: 'Tue', progress: 0 },
    { name: 'Wed', progress: 0 }, { name: 'Thu', progress: 0 },
    { name: 'Fri', progress: 0 }, { name: 'Sat', progress: 0 },
    { name: 'Sun', progress: 0 }
  ];

  const recItems = recommendations?.recommendedCourses || (Array.isArray(recommendations) ? recommendations : []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Overview
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Dashboard
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 5 }}>
          <Grid item xs={6} md={3}>
            <StatCard label="Enrolled Courses" value={stats.enrolledCourses || 0}
              icon={<School sx={{ fontSize: 16 }} />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Completed" value={stats.completedCourses || 0}
              icon={<TrendingUp sx={{ fontSize: 16 }} />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Time Spent" value={formatTime(stats.totalTimeSpent || 0)}
              icon={<Schedule sx={{ fontSize: 16 }} />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Day Streak" value={`${stats.currentStreak || 0}`}
              icon={<LocalFireDepartment sx={{ fontSize: 16 }} />}
              sub="Keep it up!" />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
                  Activity
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Learning Progress</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 6, fontSize: 12
                      }}
                    />
                    <Line type="monotone" dataKey="progress" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent activity */}
            {recentActivity.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Continue Learning</Typography>
                  {recentActivity.slice(0, 3).map((act: any, i: number) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.25 }}>{act.courseName}</Typography>
                          <Typography variant="caption" color="text.secondary">{act.progress}% complete</Typography>
                        </Box>
                        <Button component={Link} to={`/learn/${act.courseId}`} variant="outlined" size="small"
                          endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                          sx={{ fontSize: '0.78rem', py: 0.5 }}>
                          Continue
                        </Button>
                      </Box>
                      {i < recentActivity.slice(0, 3).length - 1 && <Divider />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
                  Personalized
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Recommended</Typography>
                {recItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
                      Complete your profile to get recommendations
                    </Typography>
                    <Button variant="contained" component={Link} to="/onboarding" size="small">
                      Complete Profile
                    </Button>
                  </Box>
                ) : (
                  recItems.slice(0, 4).map((rec: any, i: number) => (
                    <Box key={i}>
                      <Box sx={{ py: 2 }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 0.5 }}>
                          {rec.title || rec.course?.title || 'Course'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {rec.reason || rec.reasoning || 'Based on your profile'}
                        </Typography>
                        {rec.priorityLevel && (
                          <Chip label={rec.priorityLevel} size="small"
                            color={['high', 'critical'].includes(rec.priorityLevel) ? 'error' : 'default'} />
                        )}
                      </Box>
                      {i < Math.min(recItems.length, 4) - 1 && <Divider />}
                    </Box>
                  ))
                )}
                <Button fullWidth component={Link} to="/courses" size="small"
                  endIcon={<ArrowForward />} sx={{ mt: 2 }}>
                  Browse all courses
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
