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

    if (!isAdminMode && userType === 'STUDENT' && !fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (isAdminMode && !fullName.trim()) {
      setError('Full name is required for admin registration.');
      return;
    }

    try {
      setSubmitting(true);
      const trimmedFullName = fullName.trim();
      const trimmedCompanyName = companyName.trim();
      await register({
        email,
        password,
        userType,
        fullName: (userType === 'STUDENT' || isAdminMode) && trimmedFullName ? trimmedFullName : undefined,
        companyName: userType === 'STARTUP' && trimmedCompanyName ? trimmedCompanyName : undefined,
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
        {!isAdminMode && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#8aa6d9', fontWeight: '600' }}>
              CORE FELLOWSHIP
            </div>
            <h1 style={{ margin: '10px 0 6px 0', fontSize: '22px' }}>Create an account</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#7b8794' }}>
              Join the CORE Fellowship community
            </p>
          </div>
        )}
        {isAdminMode && (
          <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
            Admin Registration
          </h1>
        )}
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
          {!isAdminMode && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
              <button
                type="button"
                className={`account-type-toggle ${userType === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setUserType('STUDENT')}
              >
                Student
              </button>
              <button
                type="button"
                className={`account-type-toggle ${userType === 'STARTUP' ? 'active' : ''}`}
                onClick={() => setUserType('STARTUP')}
              >
                Startup
              </button>
            </div>
          )}
          {(isAdminMode || userType === 'STUDENT') && (
            <input
              type="text"
              placeholder={isAdminMode ? 'Full Name (required)' : 'Full Name'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={isAdminMode || userType === 'STUDENT'}
              style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#93c5fd'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          )}
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
            {submitting ? 'Registering...' : (isAdminMode ? 'Register' : (userType === 'STUDENT' ? 'Apply as Student' : 'Apply as Startup'))}
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
        .account-type-toggle {
          flex: 1;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #d7e3f4;
          background: #ffffff;
          color: #4b5563;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .account-type-toggle.active {
          background: #93c5fd;
          border-color: #93c5fd;
          color: #ffffff;
          box-shadow: 0 6px 16px rgba(147, 197, 253, 0.35);
        }

        .account-type-toggle:hover {
          border-color: #93c5fd;
        }

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
