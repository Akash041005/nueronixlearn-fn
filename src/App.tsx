import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import NeuroBot from './components/NeuroBot';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learn from './pages/Learn';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import TeacherDashboard from './pages/TeacherDashboard';
import Diary from './pages/Diary';
import { Exams, ExamTaking } from './pages/Exams';
import CreateCourse from './pages/CreateCourse';
import CreateExam from './pages/CreateExam';
import TeacherExamsList from './pages/TeacherExamsList';
import MyCourses from './pages/MyCourses';
import StudyPlan from './pages/StudyPlan';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

const ProtectedRoute = ({ children, requireTeacher = false }: { children: React.ReactNode; requireTeacher?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (requireTeacher && user.role !== 'teacher') return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0f172a' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={
          user?.role === 'teacher' ? <Navigate to="/teacher" /> :
            <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/learn/:courseId" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
        <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
        <Route path="/exams/:id" element={<ProtectedRoute><ExamTaking /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute requireTeacher><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/teacher/create-course" element={
          <ProtectedRoute requireTeacher><CreateCourse /></ProtectedRoute>
        } />
        <Route path="/teacher/edit-course/:id" element={
          <ProtectedRoute requireTeacher><CreateCourse /></ProtectedRoute>
        } />
        <Route path="/teacher/create-exam" element={
          <ProtectedRoute requireTeacher><CreateExam /></ProtectedRoute>
        } />
        <Route path="/teacher/exams" element={
          <ProtectedRoute requireTeacher><TeacherExamsList /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
      <NeuroBot />
    </>
  );
}

export default App;
