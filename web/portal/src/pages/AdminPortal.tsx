import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px',
      background: 'var(--bg-blue)'
    }}>
      <h1 style={{ fontSize: '36px' }}>Admin Portal</h1>
      <p style={{ color: '#666' }}>Logged in as: {user?.email}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '300px' }}>
        <button
          onClick={() => navigate('/admin/applications')}
          style={{
            padding: '14px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#93c5fd',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          View Applications & Interviews
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: '14px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}