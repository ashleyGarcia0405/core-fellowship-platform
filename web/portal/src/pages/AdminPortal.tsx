import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBriefcase, FiDownload, FiSettings, FiLogOut, FiMenu, FiX, FiCalendar } from 'react-icons/fi';
import { ACTIVE_TERM, TERM_OPTIONS, getAllApplications, getStartups } from '../lib/api';
import type { Startup } from '../lib/api';

type Stats = {
  total: number;
  submitted: number;
  interviewed: number;
  finalist: number;
  matched: number;
};
type StartupStats = {
  total: number;
  submitted: number;
  approved: number;
  active: number;
};

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    submitted: 0,
    interviewed: 0,
    finalist: 0,
    matched: 0,
  });
  const [startupStats, setStartupStats] = useState<StartupStats>({
    total: 0,
    submitted: 0,
    approved: 0,
    active: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(ACTIVE_TERM);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setStatsLoading(true);
        setStatsError('');
        const [applications, startups] = await Promise.all([
          getAllApplications({ term: selectedTerm }),
          getStartups({ term: selectedTerm }),
        ]);
        if (!isMounted) return;
        const total = applications.length;
        const submitted = applications.filter(app => app.status === 'SUBMITTED').length;
        const interviewed = applications.filter(app => app.status === 'INTERVIEWED').length;
        const finalist = applications.filter(app => app.status === 'FINALIST').length;
        const matched = applications.filter(app => app.status === 'MATCHED').length;
        const startupStats = calculateStartupStats(startups);
        setStats({
          total,
          submitted,
          interviewed,
          finalist,
          matched,
        });
        setStartupStats(startupStats);
      } catch (err: any) {
        if (!isMounted) return;
        setStatsError(err.message || 'Failed to load application stats');
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [selectedTerm]);

  const statValue = (value: number) => (statsLoading ? '—' : value.toString());
  const startupValue = (value: number) => (statsLoading ? '—' : value.toString());

  function calculateStartupStats(items: Startup[]): StartupStats {
    return {
      total: items.length,
      submitted: items.filter(s => s.status === 'submitted').length,
      approved: items.filter(s => s.status === 'approved').length,
      active: items.filter(s => s.status === 'active').length,
    };
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', position: 'relative' }}>
      {/* Mobile Menu Button */}
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

      {/* Overlay for mobile */}
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

      {/* Sidebar */}
      <div style={{
        width: '18%',
        minWidth: '220px',
        maxWidth: '280px',
        background: 'white',
        borderRight: '2px solid #e0e0e0',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 1000
      }}
      className="sidebar">
        <div style={{ marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
          <img src="/core-fellowship.png" alt="CORE Logo" style={{ width: '160px', height: 'auto' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '15px', minHeight: 0 }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            ADMIN PORTAL
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              <FiHome size={18} /> Dashboard
            </button>
            <button
              onClick={() => {
                navigate('/admin/applications');
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
              <FiUsers size={18} /> Student Applications
            </button>
            <button
              onClick={() => {
                navigate('/admin/interviews');
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
              <FiCalendar size={18} /> Interview Sign-Up
            </button>
            <button
              onClick={() => {
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
              <FiBriefcase size={18} /> Startup Applications
            </button>
          </nav>
        </div>

        <div style={{ flexShrink: 0, paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            ACCOUNT
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => {
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
              <FiSettings size={18} /> Settings
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

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }} className="main-content">
        <div style={{ maxWidth: '1200px' }}>
          <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>
            Welcome, {user?.fullName || 'Admin'}!
          </h1>
          <p style={{ color: '#666', marginBottom: '40px' }}>
            Manage CORE Fellowship applications and operations, currently focused on <strong>{selectedTerm}</strong>.
          </p>

          <div style={{
            background: 'white',
            padding: '18px 20px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cohort Focus
            </div>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '170px'
              }}
            >
              {TERM_OPTIONS.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          {/* Stats Overview */}
          <h2 style={{ fontSize: '18px', color: '#0a468f', marginBottom: '12px' }}>
            Student Applications
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Total Applications</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0a468f' }}>
                {statValue(stats.total)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>All submissions</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Submitted</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#92400e' }}>
                {statValue(stats.submitted)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Awaiting review</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Interviewed</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3730a3' }}>
                {statValue(stats.interviewed)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Completed interviews</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Finalist</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#86198f' }}>
                {statValue(stats.finalist)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Selected finalists</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Matched</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#065f46' }}>
                {statValue(stats.matched)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Matched to startups</div>
            </div>
          </div>
          <h2 style={{ fontSize: '18px', color: '#0a468f', marginBottom: '12px' }}>
            Startup Applications
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Total Startups</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0a468f' }}>
                {startupValue(startupStats.total)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>All submissions</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Submitted</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>
                {startupValue(startupStats.submitted)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Awaiting review</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Approved</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
                {startupValue(startupStats.approved)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Accepted startups</div>
            </div>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Active</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
                {startupValue(startupStats.active)}
              </div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>Currently active</div>
            </div>
          </div>
          {statsError ? (
            <div style={{ color: '#dc3545', marginBottom: '20px', fontSize: '14px' }}>
              {statsError}
            </div>
          ) : null}

          {/* Quick Actions */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', color: '#0a468f', marginBottom: '20px' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <button
                onClick={() => navigate('/admin/applications')}
                style={{
                  padding: '15px 20px',
                  background: '#93c5fd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center'
                }}
              >
                <FiUsers size={18} /> View Applications
              </button>
              <button
                style={{
                  padding: '15px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center'
                }}
              >
                <FiDownload size={18} /> Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
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
