import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserType } from '../lib/api';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const adminToken = searchParams.get('adminToken');
  const isAdminMode = !!adminToken;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>(isAdminMode ? 'ADMIN' : 'STUDENT');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    if (isAdminMode) {
      setUserType('ADMIN');
    }
  }, [isAdminMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (submitting) {
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (isAdminMode && !fullName.trim()) {
      setError('Full name is required for admin registration.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        email,
        password,
        userType,
        fullName: (userType === 'STUDENT' || isAdminMode) ? fullName : undefined,
        companyName: userType === 'STARTUP' ? companyName : undefined,
        adminToken: adminToken || undefined,
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      // Check if it's a conflict error (409) - user already exists
      if (err.message && err.message.includes('409')) {
        setSuccess(true);
        setError('');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-blue)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} className="register-box">
        <h1 style={{ textAlign: 'center', marginBottom: isAdminMode ? '10px' : '30px' }}>
          {isAdminMode ? 'Admin Registration' : 'Register'}
        </h1>
        {isAdminMode && (
          <div style={{
            background: '#e0e7ff',
            border: '1px solid #93c5fd',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#1e40af',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            🔐 Admin Registration Mode
          </div>
        )}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Password must be at least 8 characters.</span>
          </div>
          {!isAdminMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#6b7280' }}>Choose account type (required)</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
                style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              >
                <option value="STUDENT">Student</option>
                <option value="STARTUP">Startup</option>
              </select>
            </div>
          )}

          {isAdminMode && (
            <input
              type="text"
              placeholder="Full Name (required)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          )}

          {!isAdminMode && userType === 'STUDENT' && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          )}

          {!isAdminMode && userType === 'STARTUP' && (
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          )}

          {error && <div style={{ color: 'red', fontSize: '14px', padding: '10px', background: '#fee', borderRadius: '6px' }}>{error}</div>}
          {success && <div style={{ color: 'green', fontSize: '14px', padding: '10px', background: '#d4edda', borderRadius: '6px' }}>Redirecting to login...</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px',
              fontSize: '16px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              background: submitting ? '#a5b4fc' : '#93c5fd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              marginTop: '10px',
              opacity: submitting ? 0.8 : 1
            }}
          >
            {submitting ? 'Registering...' : 'Register'}
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

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 8px 0' }}>
          Having technical difficulties?
        </p>
        <p style={{ fontSize: '14px', color: '#0a468f', margin: 0 }}>
          Contact Ashley Garcia at{' '}
          <a href="mailto:ag4647@columbia.edu" style={{ color: '#0a468f', fontWeight: '600', textDecoration: 'underline' }}>
            ag4647@columbia.edu
          </a>
        </p>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .register-box {
            padding: 30px 24px !important;
          }
        }

        @media (max-width: 480px) {
          .register-box {
            padding: 24px 16px !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
