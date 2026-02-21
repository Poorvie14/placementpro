import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Layout & Common
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// TPO Pages
import TPODashboard from './pages/tpo/Dashboard';
import TpoAnalytics from './pages/tpo/Analytics';
import DriveManager from './pages/tpo/DriveManager';
import CriteriaEngine from './pages/tpo/CriteriaEngine';
import Scheduler from './pages/tpo/Scheduler';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentDrives from './pages/student/Drives';
import ApplicationTracker from './pages/student/Applications';
import SkillGap from './pages/student/SkillGap';
import ResumeWizard from './pages/student/ResumeWizard';

// Alumni Pages
import AlumniDashboard from './pages/alumni/Dashboard';
import AlumniJobs from './pages/alumni/JobPortal';
import Mentorship from './pages/alumni/Mentorship';

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Navigate to="/login" />} />

          {/* TPO Routes */}
          <Route path="tpo" element={<ProtectedRoute allowedRoles={['TPO']}><Outlet /></ProtectedRoute>}>
            <Route index element={<TPODashboard />} />
            <Route path="analytics" element={<TpoAnalytics />} />
            <Route path="drives" element={<DriveManager />} />
            <Route path="criteria" element={<CriteriaEngine />} />
            <Route path="scheduler" element={<Scheduler />} />
          </Route>

          {/* Student Routes */}
          <Route path="student" element={<ProtectedRoute allowedRoles={['STUDENT']}><Outlet /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="drives" element={<StudentDrives />} />
            <Route path="applications" element={<ApplicationTracker />} />
            <Route path="skills" element={<SkillGap />} />
            <Route path="resume" element={<ResumeWizard />} />
          </Route>

          {/* Alumni Routes */}
          <Route path="alumni" element={<ProtectedRoute allowedRoles={['ALUMNI']}><Outlet /></ProtectedRoute>}>
            <Route index element={<AlumniDashboard />} />
            <Route path="jobs" element={<AlumniJobs />} />
            <Route path="mentorship" element={<Mentorship />} />
          </Route>
        </Route>
      </Routes>

      {/* Global AI Chatbot accessible throughout the app (if logged in) */}
      {user && <ChatWidget />}
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
