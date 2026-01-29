import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-blue)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 40px',
        background: 'var(--bg-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <img
          src="/logo.svg"
          alt="CORE Logo"
          style={{
            height: '36px',
            width: 'auto'
          }}
        />
      </header>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4vh',
        padding: '4vh 2vw'
      }}>
        <div style={{
          width: '480px',
          maxWidth: '85%',
          height: '240px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <img
            src="/core-fellowship.png"
            alt="CORE Fellowship"
            style={{
              width: '100%',
              height: 'auto',
              position: 'absolute',
              top: '-25%',
              left: '0',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 36px',
              fontSize: '16px',
              cursor: 'pointer',
              background: '#93c5fd',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#60a5fa';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#93c5fd';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '14px 36px',
              fontSize: '16px',
              cursor: 'pointer',
              background: '#0a468f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#083d7a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0a468f';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Register
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-blue)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '13px',
          fontFamily: 'inherit'
        }}>
          <p style={{ margin: '2px 0' }}>
            © 2026 CORE - Columbia's Organization of Rising Entrepreneurs
          </p>
        </div>

      </footer>
    </div>
  );
}