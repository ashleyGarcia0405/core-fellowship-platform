import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiInfo, FiEdit3, FiFileText, FiLogOut, FiMenu, FiSettings, FiX } from 'react-icons/fi';
import { getApplications } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

type InterviewType = 'technical' | 'non-technical';

const CAL_BASE_URL = import.meta.env.VITE_CAL_BASE_URL || 'https://cal.com';
const CAL_TECH_PATH = import.meta.env.VITE_CAL_TECH_PATH || '/ashley-garcia-txkd7y/technical-interview-core-fellowship';
const CAL_NON_TECH_PATH = import.meta.env.VITE_CAL_NON_TECH_PATH || '/ashley-garcia-txkd7y/non-technical-interview';

export default function InterviewScheduling() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [error, setError] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('non-technical');

  useEffect(() => {
    async function loadEligibility() {
      try {
        setLoading(true);
        setError('');
        const apps = await getApplications();
        const eligibleApps = apps.filter(app => app.interviewEligible);
        setEligible(eligibleApps.length > 0);
        const app = eligibleApps[0];
        if (app?.rolePreferences?.some((role) => role.toLowerCase() === 'tech')) {
          setInterviewType('technical');
        } else {
          setInterviewType('non-technical');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load interview eligibility.');
      } finally {
        setLoading(false);
      }
    }
    loadEligibility();
  }, []);

  const bookingUrl = useMemo(() => {
    const path = interviewType === 'technical' ? CAL_TECH_PATH : CAL_NON_TECH_PATH;
    const url = new URL(path, CAL_BASE_URL);
    if (user?.email) {
      url.searchParams.set('email', user.email);
    }
    if (user?.fullName) {
      url.searchParams.set('name', user.fullName);
    }
    return url.toString();
  }, [interviewType, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '20px', color: '#0a468f' }}>Loading interview scheduling...</div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', position: 'relative' }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          display: 'none',
          background: 'white',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <FiX size={24} color="#0a468f" /> : <FiMenu size={24} color="#0a468f" />}
      </button>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      <div
        style={{
          width: '280px',
          minWidth: '280px',
          background: 'white',
          borderRight: '2px solid #e0e0e0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          boxSizing: 'border-box',
          zIndex: 1000
        }}
        className="sidebar"
      >
        <div style={{ marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
          <img src="/core-fellowship.png" alt="CORE Logo" style={{ width: '160px', height: 'auto' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '15px', minHeight: 0 }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            CORE FELLOWSHIP 2026
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => {
                navigate('/student');
                setSidebarOpen(false);
              }}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiFileText size={18} /> Information
            </button>
            <button
              onClick={() => {
                navigate('/student/apply');
                setSidebarOpen(false);
              }}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiEdit3 size={18} /> Application
            </button>
            {eligible && (
              <button
                onClick={() => {
                  setSidebarOpen(false);
                }}
                style={{
                  padding: '10px 15px',
                  textAlign: 'left',
                  background: '#e8f4ff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0a468f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FiCalendar size={18} /> Interview
              </button>
            )}
          </nav>
        </div>

        <div style={{ flexShrink: 0, paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            ACCOUNT
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiSettings size={18} /> Profile Settings
            </button>
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dc3545',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fee'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiLogOut size={18} /> Log out
            </button>
          </nav>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }} className="main-content">
        {!eligible ? (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '520px' }}>
            <FiInfo size={28} color="#0a468f" />
            <h2 style={{ marginTop: '12px', color: '#0a468f' }}>Interview Scheduling Not Available</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>
              Your application has not been approved for interviews yet. Please check back later.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: '1100px' }}>
            <h1 style={{ fontSize: '28px', color: '#0a468f', marginBottom: '8px' }}>
              Schedule Your Interview
            </h1>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Please choose one slot only. Interviews are 20 minutes with 5-minute buffers.
            </p>
            <p style={{ color: '#0a468f', fontWeight: '600', marginBottom: '24px' }}>
              You are scheduled for a {interviewType === 'technical' ? 'Technical' : 'Non-technical'} interview.
            </p>

            {error && (
              <div style={{ marginBottom: '20px', background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '12px 16px', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <iframe
                title="Interview Scheduling"
                src={bookingUrl}
                style={{ width: '100%', height: '780px', border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .sidebar {
            position: fixed !important;
            left: ${sidebarOpen ? '0' : '-280px'} !important;
            transition: left 0.3s ease;
            height: 100vh !important;
            width: 280px !important;
            min-width: 280px !important;
          }
          .main-content {
            padding: 80px 20px 40px 20px !important;
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
