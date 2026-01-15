import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '20px'
    }}>
      <h1>Core Fellowship</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => navigate('/login')}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Register
        </button>
      </div>
    </div>
  );
}