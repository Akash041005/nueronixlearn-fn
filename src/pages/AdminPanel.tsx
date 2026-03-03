import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress, Tabs, Tab, Card, CardContent,
  Grid, Avatar, Select, MenuItem, FormControl, InputLabel, InputAdornment, LinearProgress,
  Switch, FormControlLabel, Snackbar
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Add, Delete, Logout, Person, School, Assignment, BarChart, Search, Star, 
  TrendingUp, People, MenuBook, Quiz, AdminPanelSettings, Refresh, Edit, Check,
  Close, PersonAdd, WorkspacePremium, Visibility, VisibilityOff
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import AnimatedBackground from '../components/AnimatedBackground';

const GREEN_ACCENT = '#00FF88';
const GREEN_DARK = '#00CC6A';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatar?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  teacherId: { name: string; email: string; _id?: string };
  enrollments: number;
  featured: boolean;
  createdAt: string;
  thumbnail?: string;
}

interface Exam {
  _id: string;
  title: string;
  published: boolean;
  createdBy: { name: string; email: string };
  createdAt: string;
}

const MotionCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AnimatedStatCard = ({ icon: Icon, label, value, color, delay, suffix = '' }: { 
  icon: React.ElementType; 
  label: string; 
  value: number | string; 
  color: string;
  delay: number;
  suffix?: string;
}) => {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0;
    let start = 0;
    const duration = 1500;
    const increment = numValue / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card sx={{ 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.3)})`,
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              background: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon sx={{ color, fontSize: 28 }} />
            </Box>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <TrendingUp sx={{ color: alpha(color, 0.5), fontSize: 20 }} />
            </motion.div>
          </Box>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, color: 'text.primary' }}>
            {displayValue}{suffix}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Stats
  const [stats, setStats] = useState<any>({});
  const [liveCourseCount, setLiveCourseCount] = useState(0);
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  
  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  
  // Exams
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsTotal, setExamsTotal] = useState(0);
  const [examSearch, setExamSearch] = useState('');
  const [examPage, setExamPage] = useState(1);
  
  // Admins
  const [admins, setAdmins] = useState<any[]>([]);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', email: '', isSuperAdmin: false });
  const [saving, setSaving] = useState(false);

  // Teachers
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', phone: '' });
  
  // Add Course
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: '', teacherId: '' });
  const [teachers, setTeachers] = useState<User[]>([]);
  
  // Analytics
  const [analytics, setAnalytics] = useState<any>({});

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin-login');
    } else {
      loadData();
    }
  }, [token]);

  useEffect(() => {
    if (tab === 1) loadUsers();
    if (tab === 2) loadCourses();
    if (tab === 3) loadExams();
    if (tab === 4) loadAdmins();
    if (tab === 5) loadAnalytics();
    if (tab === 6) loadTeachers();
  }, [tab]);

  // Live course count polling
  useEffect(() => {
    const fetchLiveCount = async () => {
      try {
        const res = await adminAPI.getStats();
        setLiveCourseCount(res.data.stats.totalCourses || 0);
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to fetch live stats');
      }
    };

    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
      setLiveCourseCount(res.data.stats.totalCourses || 0);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ page: userPage, limit: 10, search: userSearch });
      setUsers(res.data.users);
      setUsersTotal(res.data.total);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await adminAPI.getCourses({ page: coursePage, limit: 10, search: courseSearch });
      setCourses(res.data.courses);
      setCoursesTotal(res.data.total);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const loadExams = async () => {
    try {
      const res = await adminAPI.getExams({ page: examPage, limit: 10, search: examSearch });
      setExams(res.data.exams);
      setExamsTotal(res.data.total);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await adminAPI.listAdmins();
      setAdmins(res.data.admins);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await adminAPI.getAnalytics(30);
      setAnalytics(res.data);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await adminAPI.getUsers({ page: 1, limit: 100, role: 'teacher' });
      setTeachers(res.data.users || []);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleAuthError = (err: any) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('adminToken');
      navigate('/admin-login');
    }
    setError('Action failed');
    setSnackbar({ open: true, message: 'Action failed', severity: 'error' });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      showSnackbar('User deleted successfully');
      loadUsers();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await adminAPI.updateUserRole(id, role);
      showSnackbar(`Role updated to ${role}`);
      loadUsers();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to update role', 'error');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await adminAPI.deleteCourse(id);
      showSnackbar('Course deleted successfully');
      loadCourses();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to delete course', 'error');
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await adminAPI.updateCourseFeatured(id, !featured);
      showSnackbar(featured ? 'Removed from featured' : 'Added to featured');
      loadCourses();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to update course', 'error');
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await adminAPI.deleteExam(id);
      showSnackbar('Exam deleted successfully');
      loadExams();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to delete exam', 'error');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.email) {
      setError('All fields required');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.addAdmin(newAdmin);
      showSnackbar('Admin added successfully');
      setAddAdminOpen(false);
      setNewAdmin({ username: '', password: '', email: '', isSuperAdmin: false });
      loadAdmins();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to add admin', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) {
      showSnackbar('Name, email and password are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTeacher, role: 'teacher' })
      });
      if (!res.ok) throw new Error('Failed to create teacher');
      showSnackbar('Teacher added successfully');
      setAddTeacherOpen(false);
      setNewTeacher({ name: '', email: '', password: '', phone: '' });
      loadUsers();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to add teacher', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.category || !newCourse.teacherId) {
      showSnackbar('Title, category and teacher are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/courses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });
      if (!res.ok) throw new Error('Failed to create course');
      showSnackbar('Course created successfully');
      setAddCourseOpen(false);
      setNewCourse({ title: '', description: '', category: '', teacherId: '' });
      loadCourses();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to create course', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Remove this admin?')) return;
    try {
      await adminAPI.removeAdmin(id);
      showSnackbar('Admin removed');
      loadAdmins();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to remove admin', 'error');
    }
  };

  const handlePromoteToTeacher = async (userId: string) => {
    try {
      await adminAPI.updateUserRole(userId, 'teacher');
      showSnackbar('User promoted to teacher');
      loadUsers();
    } catch (err: any) {
      showSnackbar(err.response?.data?.error || 'Failed to promote user', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: isDark ? '#050A0D' : '#F5F7F9'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <CircularProgress sx={{ color: GREEN_ACCENT }} />
        </motion.div>
      </Box>
    );
  }

  const menuItems = [
    { icon: BarChart, label: 'Dashboard', color: GREEN_ACCENT },
    { icon: People, label: 'Users', color: '#00D9FF' },
    { icon: MenuBook, label: 'Courses', color: '#FFBE0B' },
    { icon: Quiz, label: 'Exams', color: '#FF4757' },
    { icon: AdminPanelSettings, label: 'Admins', color: '#9B59B6' },
    { icon: WorkspacePremium, label: 'Teachers', color: '#E91E63' },
    { icon: TrendingUp, label: 'Analytics', color: '#00FF88' },
  ];

  return (
    <AnimatedBackground>
      <Box sx={{ minHeight: '100vh' }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ 
            p: 2, 
            borderRadius: 0,
            background: isDark 
              ? 'rgba(5, 10, 13, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${alpha(GREEN_ACCENT, 0.1)}`
          }}>
            <Container maxWidth="xl">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AdminPanelSettings sx={{ fontSize: 36, color: GREEN_ACCENT }} />
                  </motion.div>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Admin Panel
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Real-time monitoring
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Chip 
                      icon={<MenuBook sx={{ fontSize: 16 }} />}
                      label={`${liveCourseCount} Live Courses`}
                      sx={{ 
                        background: alpha(GREEN_ACCENT, 0.15),
                        color: GREEN_ACCENT,
                        fontWeight: 600,
                        border: `1px solid ${alpha(GREEN_ACCENT, 0.3)}`,
                        '& .MuiChip-icon': { color: GREEN_ACCENT }
                      }}
                    />
                  </motion.div>
                  <Button 
                    variant="outlined" 
                    startIcon={<Logout />} 
                    onClick={handleLogout}
                    sx={{ 
                      borderColor: alpha(GREEN_ACCENT, 0.5),
                      color: GREEN_ACCENT,
                      '&:hover': {
                        borderColor: GREEN_ACCENT,
                        background: alpha(GREEN_ACCENT, 0.1)
                      }
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>
            </Container>
          </Paper>
        </motion.div>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={2}>
              <AnimatedStatCard 
                icon={People} 
                label="Total Users" 
                value={stats.totalUsers || 0} 
                color={GREEN_ACCENT}
                delay={0}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <AnimatedStatCard 
                icon={Person} 
                label="Students" 
                value={stats.totalStudents || 0} 
                color="#00D9FF"
                delay={0.1}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <AnimatedStatCard 
                icon={WorkspacePremium} 
                label="Teachers" 
                value={stats.totalTeachers || 0} 
                color="#E91E63"
                delay={0.2}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <AnimatedStatCard 
                icon={MenuBook} 
                label="Courses" 
                value={liveCourseCount} 
                color="#FFBE0B"
                delay={0.3}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <AnimatedStatCard 
                icon={Quiz} 
                label="Exams" 
                value={stats.totalExams || 0} 
                color="#FF4757"
                delay={0.4}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <AnimatedStatCard 
                icon={TrendingUp} 
                label="Enrollments" 
                value={stats.totalEnrollments || 0} 
                color="#9B59B6"
                delay={0.5}
              />
            </Grid>
          </Grid>

          {/* Tabs */}
          <MotionCard delay={0.6}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Tabs 
                value={tab} 
                onChange={(_, v) => setTab(v)} 
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  px: 2,
                  '& .MuiTab-root': {
                    minWidth: 'auto',
                    px: 3,
                  }
                }}
              >
                {menuItems.map((item, index) => (
                  <Tab 
                    key={index}
                    icon={<item.icon />} 
                    label={item.label} 
                    iconPosition="start"
                    sx={{ 
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: item.color
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Paper>
          </MotionCard>

          {/* Dashboard Tab */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <MotionCard delay={0.2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People sx={{ color: GREEN_ACCENT }} />
                        Recent Users
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Role</TableCell>
                              <TableCell>Joined</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(stats.recentUsers || []).slice(0, 5).map((u: any, i: number) => (
                              <motion.tr
                                key={u._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                      {u.name?.charAt(0)}
                                    </Avatar>
                                    {u.name}
                                  </Box>
                                </TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={u.role} 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: u.role === 'admin' ? alpha('#9B59B6', 0.15) :
                                              u.role === 'teacher' ? alpha('#E91E63', 0.15) :
                                              alpha(GREEN_ACCENT, 0.15),
                                      color: u.role === 'admin' ? '#9B59B6' :
                                             u.role === 'teacher' ? '#E91E63' :
                                             GREEN_ACCENT,
                                      fontWeight: 600
                                    }} 
                                  />
                                </TableCell>
                                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </MotionCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <MotionCard delay={0.3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MenuBook sx={{ color: '#FFBE0B' }} />
                        Top Courses
                      </Typography>
                      {(analytics.topCourses || []).slice(0, 5).map((c: any, i: number) => (
                        <Box key={c._id} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 1.5,
                          borderBottom: `1px solid ${alpha(GREEN_ACCENT, 0.05)}`,
                          '&:last-child': { borderBottom: 'none' }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={i + 1} 
                              size="small"
                              sx={{ 
                                minWidth: 24, 
                                height: 24,
                                bgcolor: i === 0 ? alpha('#FFBE0B', 0.2) : 'transparent',
                                color: i === 0 ? '#FFBE0B' : 'text.secondary'
                              }} 
                            />
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {c.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {c.enrollments}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </MotionCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Users Tab */}
          <TabPanel value={tab} index={1}>
            <MotionCard delay={0.2}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">All Users</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField 
                        size="small" 
                        placeholder="Search users..." 
                        value={userSearch} 
                        onChange={(e) => setUserSearch(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                        }}
                      />
                      <Button variant="contained" onClick={loadUsers} startIcon={<Search />}>Search</Button>
                    </Box>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Joined</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {users.map((user, i) => (
                            <motion.tr
                              key={user._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 36, height: 36 }}>
                                    {user.name?.charAt(0)}
                                  </Avatar>
                                  {user.name}
                                </Box>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Select 
                                  size="small" 
                                  value={user.role} 
                                  onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                  sx={{ minWidth: 120 }}
                                >
                                  <MenuItem value="student">Student</MenuItem>
                                  <MenuItem value="teacher">Teacher</MenuItem>
                                  <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                              </TableCell>
                              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {user.role === 'student' && (
                                    <IconButton 
                                      color="primary" 
                                      onClick={() => handlePromoteToTeacher(user._id)}
                                      title="Promote to Teacher"
                                    >
                                      <WorkspacePremium />
                                    </IconButton>
                                  )}
                                  <IconButton 
                                    color="error" 
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </MotionCard>
          </TabPanel>

          {/* Courses Tab */}
          <TabPanel value={tab} index={2}>
            <MotionCard delay={0.2}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">All Courses</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField 
                        size="small" 
                        placeholder="Search courses..." 
                        value={courseSearch} 
                        onChange={(e) => setCourseSearch(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && loadCourses()}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                        }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={() => {
                          loadTeachers();
                          setAddCourseOpen(true);
                        }} 
                        startIcon={<Add />}
                      >
                        Add Course
                      </Button>
                    </Box>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Enrollments</TableCell>
                          <TableCell>Featured</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {courses.map((course, i) => (
                          <motion.tr
                            key={course._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>{course.title}</TableCell>
                            <TableCell>
                              <Chip 
                                label={course.category} 
                                size="small"
                                sx={{ 
                                  bgcolor: alpha('#FFBE0B', 0.1),
                                  color: '#FFBE0B'
                                }}
                              />
                            </TableCell>
                            <TableCell>{course.teacherId?.name}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUp sx={{ fontSize: 16, color: GREEN_ACCENT }} />
                                {course.enrollments}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                onClick={() => handleToggleFeatured(course._id, course.featured)}
                              >
                                {course.featured ? (
                                  <Star sx={{ color: '#FFBE0B' }} />
                                ) : (
                                  <Star sx={{ color: 'text.disabled' }} />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteCourse(course._id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </MotionCard>
          </TabPanel>

          {/* Exams Tab */}
          <TabPanel value={tab} index={3}>
            <MotionCard delay={0.2}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">All Exams</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField 
                        size="small" 
                        placeholder="Search exams..." 
                        value={examSearch} 
                        onChange={(e) => setExamSearch(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && loadExams()}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                        }}
                      />
                      <Button variant="contained" onClick={loadExams} startIcon={<Search />}>Search</Button>
                    </Box>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Created By</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {exams.map((exam, i) => (
                          <motion.tr
                            key={exam._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>{exam.title}</TableCell>
                            <TableCell>{exam.createdBy?.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={exam.published ? 'Published' : 'Draft'} 
                                color={exam.published ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(exam.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteExam(exam._id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </MotionCard>
          </TabPanel>

          {/* Admins Tab */}
          <TabPanel value={tab} index={4}>
            <MotionCard delay={0.2}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Admin Management</Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<Add />} 
                      onClick={() => setAddAdminOpen(true)}
                    >
                      Add Admin
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {admins.map((admin, i) => (
                          <motion.tr
                            key={admin._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>{admin.username}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>
                              <Chip 
                                label={admin.isSuperAdmin ? 'Super Admin' : 'Admin'} 
                                color={admin.isSuperAdmin ? 'primary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteAdmin(admin._id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </MotionCard>
          </TabPanel>

          {/* Teachers Tab */}
          <TabPanel value={tab} index={5}>
            <MotionCard delay={0.2}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">Teacher Management</Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<PersonAdd />} 
                      onClick={() => setAddTeacherOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #F06292 0%, #E91E63 100%)',
                        }
                      }}
                    >
                      Add Teacher
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    {users.filter(u => u.role === 'teacher').map((teacher, i) => (
                      <Grid item xs={12} sm={6} md={4} key={teacher._id}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card sx={{ 
                            background: isDark 
                              ? 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(5, 10, 13, 0.9) 100%)'
                              : 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, #fff 100%)',
                            border: `1px solid ${alpha('#E91E63', 0.2)}`
                          }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ 
                                  width: 48, 
                                  height: 48,
                                  background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)'
                                }}>
                                  {teacher.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight={600}>{teacher.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">{teacher.email}</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  startIcon={<WorkspacePremium />}
                                  onClick={() => handleUpdateRole(teacher._id, 'admin')}
                                  sx={{ 
                                    borderColor: alpha('#9B59B6', 0.5),
                                    color: '#9B59B6',
                                    flex: 1
                                  }}
                                >
                                  Promote
                                </Button>
                                <IconButton 
                                  color="error" 
                                  size="small"
                                  onClick={() => handleDeleteUser(teacher._id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </MotionCard>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tab} index={6}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MotionCard delay={0.2}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3 }}>User Growth (Last 30 days)</Typography>
                      {(analytics.userGrowth || []).length === 0 ? (
                        <Typography color="text.secondary">No data available</Typography>
                      ) : (
                        (analytics.userGrowth || []).slice(-10).map((u: any, i: number) => (
                          <Box key={i} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            py: 1,
                            borderBottom: `1px solid ${alpha(GREEN_ACCENT, 0.05)}`
                          }}>
                            <Typography>{u._id}</Typography>
                            <Typography fontWeight={600} color={GREEN_ACCENT}>
                              {u.count} users
                            </Typography>
                          </Box>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </MotionCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <MotionCard delay={0.3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3 }}>Top Teachers</Typography>
                      {(analytics.topTeachers || []).map((t: any, i: number) => (
                        <Box key={i} sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 1.5,
                          borderBottom: `1px solid ${alpha(GREEN_ACCENT, 0.05)}`
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={i + 1} 
                              size="small"
                              sx={{ 
                                bgcolor: alpha('#E91E63', 0.1),
                                color: '#E91E63'
                              }}
                            />
                            <Typography fontWeight={500}>{t.name}</Typography>
                          </Box>
                          <Typography color="text.secondary">
                            {t.teacherProfile?.totalStudents || 0} students
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </MotionCard>
              </Grid>
            </Grid>
          </TabPanel>
        </Container>

        {/* Add Admin Dialog */}
        <Dialog open={addAdminOpen} onClose={() => setAddAdminOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminPanelSettings sx={{ color: GREEN_ACCENT }} />
            Add New Admin
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                label="Username" 
                value={newAdmin.username} 
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })} 
                fullWidth 
              />
              <TextField 
                label="Email" 
                type="email" 
                value={newAdmin.email} 
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} 
                fullWidth 
              />
              <TextField 
                label="Password" 
                type="password" 
                value={newAdmin.password} 
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} 
                fullWidth 
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={newAdmin.isSuperAdmin}
                    onChange={(e) => setNewAdmin({ ...newAdmin, isSuperAdmin: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: GREEN_ACCENT,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: GREEN_ACCENT,
                      },
                    }}
                  />
                }
                label="Super Admin"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddAdminOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddAdmin} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Add Admin'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Teacher Dialog */}
        <Dialog open={addTeacherOpen} onClose={() => setAddTeacherOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#E91E63' }}>
            <PersonAdd />
            Add New Teacher
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                label="Full Name" 
                value={newTeacher.name} 
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} 
                fullWidth 
                required
              />
              <TextField 
                label="Email" 
                type="email" 
                value={newTeacher.email} 
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} 
                fullWidth 
                required
              />
              <TextField 
                label="Phone" 
                value={newTeacher.phone} 
                onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} 
                fullWidth 
              />
              <TextField 
                label="Password" 
                type="password" 
                value={newTeacher.password} 
                onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} 
                fullWidth 
                required
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddTeacherOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleAddTeacher} 
              disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F06292 0%, #E91E63 100%)',
                }
              }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Add Teacher'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Course Dialog */}
        <Dialog open={addCourseOpen} onClose={() => setAddCourseOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FFBE0B' }}>
            <MenuBook />
            Create New Course
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField 
                label="Course Title" 
                value={newCourse.title} 
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} 
                fullWidth 
                required
              />
              <TextField 
                label="Description" 
                value={newCourse.description} 
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} 
                fullWidth 
                multiline
                rows={3}
              />
              <TextField 
                label="Category" 
                value={newCourse.category} 
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} 
                fullWidth 
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Select Teacher</InputLabel>
                <Select 
                  value={newCourse.teacherId} 
                  onChange={(e) => setNewCourse({ ...newCourse, teacherId: e.target.value })}
                  label="Select Teacher"
                >
                  {teachers.map(t => (
                    <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddCourseOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleAddCourse} 
              disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #FFBE0B 0%, #F59E0B 100%)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FCD34D 0%, #FFBE0B 100%)',
                }
              }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Create Course'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ 
              bgcolor: snackbar.severity === 'success' 
                ? alpha(GREEN_ACCENT, 0.15) 
                : alpha('#FF4757', 0.15),
              color: snackbar.severity === 'success' ? GREEN_ACCENT : '#FF4757',
              border: `1px solid ${alpha(snackbar.severity === 'success' ? GREEN_ACCENT : '#FF4757', 0.3)}`,
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'success' ? GREEN_ACCENT : '#FF4757'
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AnimatedBackground>
  );
};

export default AdminPanel;
