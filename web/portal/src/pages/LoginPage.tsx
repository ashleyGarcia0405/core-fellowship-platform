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
      // Check if it's a 401 (authentication failure)
      if (err.message && err.message.includes('401')) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-blue)'
    }}>
      <div style={{ width: '400px', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          {error && <div style={{ color: 'red', fontSize: '14px', padding: '10px', background: '#fee', borderRadius: '6px' }}>{error}</div>}
          <button type="submit" style={{ padding: '14px', fontSize: '16px', cursor: 'pointer', background: '#93c5fd', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', marginTop: '10px' }}>
            Login
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#0a468f', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}