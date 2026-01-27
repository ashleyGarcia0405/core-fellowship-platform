import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPortal from './pages/AdminPortal';
import StudentDashboard from './pages/student/StudentDashboard';
import StartupPortal from './pages/StartupPortal';
import AdminDashboard from './pages/admin/AdminDashboard';
import InterviewForm from './pages/admin/InterviewForm';
import ApplicationForm from './pages/student/ApplicationForm';
import IntakeForm from './pages/startup/IntakeForm';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/interview/:applicationId"
            element={
              <ProtectedRoute>
                <InterviewForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/apply"
            element={
              <ProtectedRoute>
                <ApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/startup"
            element={
              <ProtectedRoute>
                <StartupPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/startup/intake"
            element={
              <ProtectedRoute>
                <IntakeForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
