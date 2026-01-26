import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserType } from '../lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await register({
        email,
        password,
        userType,
        fullName: userType === 'STUDENT' ? fullName : undefined,
        companyName: userType === 'STARTUP' ? companyName : undefined,
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Register</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#54a1ff'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#54a1ff'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
            style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
          >
            <option value="STUDENT">Student</option>
            <option value="STARTUP">Startup</option>
          </select>

          {userType === 'STUDENT' && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#54a1ff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          )}

          {userType === 'STARTUP' && (
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#54a1ff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          )}

          {error && <div style={{ color: 'red', fontSize: '14px', padding: '10px', background: '#fee', borderRadius: '6px' }}>{error}</div>}
          {success && <div style={{ color: 'green', fontSize: '14px', padding: '10px', background: '#d4edda', borderRadius: '6px' }}>Registration successful! Redirecting to login...</div>}

          <button type="submit" style={{ padding: '14px', fontSize: '16px', cursor: 'pointer', background: '#54a1ff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', marginTop: '10px' }}>
            Register
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