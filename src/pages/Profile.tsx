import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, TextField, Button, CircularProgress, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setStats(res.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 48 }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block', 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 1, 
                  bgcolor: 'primary.light', 
                  color: 'white',
                  mt: 1
                }}
              >
                {user?.role}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Learning Statistics
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Enrolled Courses', value: stats?.enrolledCourses || 0 },
                  { label: 'Completed Courses', value: stats?.completedCourses || 0 },
                  { label: 'Total Time Spent', value: `${Math.floor((stats?.totalTimeSpent || 0) / 60)}h` },
                  { label: 'Current Streak', value: `${stats?.currentStreak || 0} days` }
                ].map((item, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Account Settings
              </Typography>
              <TextField
                fullWidth
                label="Name"
                defaultValue={user?.name}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                defaultValue={user?.email}
                margin="normal"
                disabled
              />
              <Button variant="contained" sx={{ mt: 2 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
