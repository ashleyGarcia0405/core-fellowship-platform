import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import InformationPage from './pages/InformationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPortal from './pages/AdminPortal';
import StudentDashboard from './pages/student/StudentDashboard';
import StartupPortal from './pages/StartupPortal';
import AdminDashboard from './pages/admin/AdminDashboard';
import VCPortal from './pages/VCPortal';
import VCDashboard from './pages/vc/VCDashboard';
import InterviewForm from './pages/admin/InterviewForm';
import ApplicationForm from './pages/student/ApplicationForm';
import IntakeForm from './pages/startup/IntakeForm';
import InterviewScheduling from './pages/student/InterviewScheduling';
import MatchPreferenceForm from './pages/student/MatchPreferenceForm';
import InterviewSignup from './pages/admin/InterviewSignup';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/information" element={<InformationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/interview/:applicationId"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <InterviewForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/interviews"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <InterviewSignup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/startups/new"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <IntakeForm />
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
            path="/student/interview"
            element={
              <ProtectedRoute>
                <InterviewScheduling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/match-preferences"
            element={
              <ProtectedRoute>
                <MatchPreferenceForm />
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
          <Route
            path="/vc"
            element={
              <ProtectedRoute requiredUserType="VC">
                <VCPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vc/talent"
            element={
              <ProtectedRoute requiredUserType="VC">
                <VCDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
