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
      minHeight: '100vh'
    }}>
      <div style={{ width: '300px' }}>
        <h1>Register</h1>
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
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
            style={{ padding: '8px', fontSize: '14px' }}
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
              style={{ padding: '8px', fontSize: '14px' }}
            />
          )}

          {userType === 'STARTUP' && (
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ padding: '8px', fontSize: '14px' }}
            />
          )}

          {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}
          {success && <div style={{ color: 'green', fontSize: '14px' }}>Registration successful! Redirecting to login...</div>}

          <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>
            Register
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