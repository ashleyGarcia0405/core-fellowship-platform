import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login(email, password);

      // Redirect based on user type
      if (response.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (response.userType === 'STUDENT') {
        navigate('/student');
      } else if (response.userType === 'STARTUP') {
        navigate('/startup');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <div style={{ width: '300px' }}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '8px', fontSize: '14px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '8px', fontSize: '14px' }}
          />
          {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}
          <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>
            Login
          </button>
        </form>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}