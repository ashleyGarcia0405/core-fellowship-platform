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
      gap: '20px'
    }}>
      <h1>You are in the admin portal</h1>
      <p>Logged in as: {user?.email}</p>
      <button
        onClick={handleLogout}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
}