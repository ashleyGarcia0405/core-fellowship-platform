import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBriefcase, FiDownload, FiSettings, FiLogOut } from 'react-icons/fi';

export default function AdminPortal() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)' }}>
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
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
          <img src="/core-fellowship.png" alt="CORE Logo" style={{ width: '160px', height: 'auto' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '15px', minHeight: 0 }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            ADMIN PORTAL
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
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
              onClick={() => navigate('/admin/applications')}
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
              onClick={handleLogout}
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
      <div style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }}>
        <div style={{ maxWidth: '1200px' }}>
          <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>
            Welcome, Admin!
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
    </div>
  );
}
