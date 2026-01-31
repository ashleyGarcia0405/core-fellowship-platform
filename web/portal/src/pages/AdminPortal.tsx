import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBriefcase, FiDownload, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
            Manage CORE Fellowship applications and operations.
          </p>

          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Applications</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0a468f' }}>—</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>All submissions</div>
            </div>
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Pending Review</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffc107' }}>—</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Awaiting action</div>
            </div>
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Under Review</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#17a2b8' }}>—</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>In progress</div>
            </div>
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Accepted</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#28a745' }}>—</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Admitted students</div>
            </div>
          </div>

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
