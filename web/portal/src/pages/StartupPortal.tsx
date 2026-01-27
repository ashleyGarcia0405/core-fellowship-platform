import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiEdit3, FiBriefcase, FiSettings, FiLogOut, FiCalendar, FiCheckCircle } from 'react-icons/fi';

export default function StartupPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const timeline = [
    {
      date: 'Jan 27',
      title: 'Startup Intake Opens',
      description: 'Complete the intake form to share your team, product, and internship needs.',
      status: 'completed'
    },
    {
      date: 'TBD',
      title: 'Intake Deadline',
      description: 'Submit your intake form to be considered for the 2026 matching cycle.',
      status: 'upcoming'
    },
    {
      date: 'TBD',
      title: 'Candidate Review',
      description: 'We will review student applications and share a short list with your team.',
      status: 'future'
    },
    {
      date: 'TBD',
      title: 'Matching & Offers',
      description: 'Coordinate interviews and finalize matches with CORE Fellows.',
      status: 'future'
    },
    {
      date: 'TBD',
      title: 'Internship Kickoff',
      description: 'Onboarding and project scoping with your matched fellow(s).',
      status: 'future'
    }
  ];

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
            STARTUP PARTNERS 2026
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
              <FiFileText size={18} /> Overview
            </button>
            <button
              onClick={() => navigate('/startup/intake')}
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
              <FiEdit3 size={18} /> Intake Form
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
              <FiBriefcase size={18} /> Matching Status
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
              <FiSettings size={18} /> Profile Settings
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
        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>
            Welcome, {user?.fullName || user?.email?.split('@')[0] || 'Startup Team'}!
          </h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            This is your startup dashboard for CORE Fellowship partnerships and matching.
          </p>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div>
              <h2 style={{ fontSize: '20px', color: '#0a468f', marginBottom: '8px' }}>
                Complete your startup intake
              </h2>
              <p style={{ color: '#666', margin: 0, lineHeight: '1.6' }}>
                Tell us about your product, team, and the role you want to host. We use this to match you with fellows.
              </p>
            </div>
            <button
              onClick={() => navigate('/startup/intake')}
              style={{
                padding: '12px 18px',
                fontSize: '14px',
                cursor: 'pointer',
                background: '#0a468f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              Go to Intake Form
            </button>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ fontSize: '20px', color: '#0a468f', marginBottom: '20px' }}>
              Startup Partnership Timeline
            </h2>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              Track the key dates for intake, matching, and onboarding. We’ll notify you by email if anything changes.
            </p>

            {/* Timeline */}
            <div style={{ marginTop: '30px' }}>
              {timeline.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.status === 'completed' ? '#93c5fd' : item.status === 'upcoming' ? '#93c5fd' : '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {item.status === 'completed' ? <FiCheckCircle size={20} /> : <FiCalendar size={18} />}
                    </div>
                    {index < timeline.length - 1 && (
                      <div style={{
                        width: '2px',
                        flex: 1,
                        minHeight: '40px',
                        background: '#e0e0e0',
                        marginTop: '8px'
                      }} />
                    )}
                  </div>

                  <div style={{ flex: 1, paddingBottom: '20px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: '600',
                      background: '#93c5fd',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      marginBottom: '8px'
                    }}>
                      <FiCalendar size={12} />
                      {item.date}
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      color: '#0a468f',
                      marginBottom: '8px',
                      fontWeight: '600'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
