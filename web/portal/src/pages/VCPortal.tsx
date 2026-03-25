import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiStar, FiLogOut, FiMenu, FiX, FiBriefcase, FiPlus } from 'react-icons/fi';
import {
  getAllApplications,
  getVcFavorites,
  getVcPortfolioInvites,
  createVcPortfolioInvite,
} from '../lib/api';
import type { VcPortfolioInvite } from '../lib/api';

export default function VCPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [finalists, setFinalists] = useState(0);
  const [matched, setMatched] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // Portfolio invites
  const [invites, setInvites] = useState<VcPortfolioInvite[]>([]);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCompanyName, setInviteCompanyName] = useState('');
  const [inviteCompanyEmail, setInviteCompanyEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([getAllApplications(), getVcFavorites()])
      .then(([apps, favs]) => {
        if (!mounted) return;
        setTotalStudents(apps.length);
        setFinalists(apps.filter((a: any) => a.status === 'finalist').length);
        setMatched(apps.filter((a: any) => a.status === 'matched').length);
        setSavedCount(favs.length);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setStatsLoading(false); });

    getVcPortfolioInvites()
      .then((data) => { if (mounted) setInvites(data); })
      .catch(() => {})
      .finally(() => { if (mounted) setInviteLoading(false); });

    return () => { mounted = false; };
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    if (!inviteCompanyName.trim() || !inviteCompanyEmail.trim()) {
      setInviteError('Company name and email are required.');
      return;
    }
    try {
      setInviteSubmitting(true);
      const invite = await createVcPortfolioInvite({
        companyName: inviteCompanyName.trim(),
        companyEmail: inviteCompanyEmail.trim(),
      });
      setInvites(prev => [invite, ...prev]);
      setInviteSuccess(`Invite sent to ${invite.companyEmail}`);
      setInviteCompanyName('');
      setInviteCompanyEmail('');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
      }, 2000);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invite');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const statValue = (v: number) => statsLoading ? '—' : v.toString();

  const sidebarStyle: React.CSSProperties = {
    width: '18%',
    minWidth: '220px',
    maxWidth: '280px',
    background: 'white',
    borderRight: '2px solid #e0e0e0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
    zIndex: 1000,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', position: 'relative' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-menu-btn"
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 1001,
          display: 'none', background: 'white', border: '2px solid #e0e0e0',
          borderRadius: '8px', padding: '10px', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {sidebarOpen ? <FiX size={24} color="#0a468f" /> : <FiMenu size={24} color="#0a468f" />}
      </button>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="mobile-overlay"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'none' }}
        />
      )}

      {/* Sidebar */}
      <div style={sidebarStyle} className="sidebar">
        <div style={{ marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
          <img src="/core-fellowship.png" alt="CORE Logo" style={{ width: '160px', height: 'auto' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '15px', minHeight: 0 }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            VC PORTAL
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: <FiHome size={18} />, label: 'Home', path: '/vc', active: true },
              { icon: <FiUsers size={18} />, label: 'Talent Directory', path: '/vc/talent', active: false },
              { icon: <FiStar size={18} />, label: 'My Favorites', path: '/vc/talent', active: false },
            ].map(({ icon, label, path, active }) => (
              <button
                key={label}
                onClick={() => { navigate(path); setSidebarOpen(false); }}
                style={{
                  padding: '10px 15px', textAlign: 'left',
                  background: active ? '#e8f4ff' : 'transparent',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '500',
                  color: active ? '#0a468f' : '#333',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {icon} {label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ flexShrink: 0, paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
          <button
            onClick={() => { handleLogout(); setSidebarOpen(false); }}
            style={{
              padding: '10px 15px', textAlign: 'left', background: 'transparent',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
              fontWeight: '500', color: '#dc3545', display: 'flex', alignItems: 'center', gap: '10px', width: '100%'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fee'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FiLogOut size={18} /> Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }} className="main-content">
        <div style={{ maxWidth: '1200px' }}>
          <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>
            Welcome, {user?.fullName || 'VC Partner'}!
          </h1>
          <p style={{ color: '#666', marginBottom: '40px' }}>
            Browse talent and manage your portfolio pipeline.
          </p>

          {/* Stats */}
          <h2 style={{ fontSize: '18px', color: '#0a468f', marginBottom: '12px' }}>Talent Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'Total Students', value: statValue(totalStudents), color: '#0a468f', sub: 'In talent pool' },
              { label: 'Finalists', value: statValue(finalists), color: '#86198f', sub: 'Top candidates' },
              { label: 'Matched', value: statValue(matched), color: '#065f46', sub: 'Placed at startups' },
              { label: 'My Saved', value: statValue(savedCount), color: '#1e40af', sub: 'In your shortlist' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{ background: 'white', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', color: '#0a468f', marginBottom: '20px' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <button
                onClick={() => navigate('/vc/talent')}
                style={{ padding: '15px 20px', background: '#93c5fd', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}
              >
                <FiUsers size={18} /> Browse Talent
              </button>
              <button
                onClick={() => { navigate('/vc/talent'); }}
                style={{ padding: '15px 20px', background: '#a78bfa', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}
              >
                <FiStar size={18} /> My Favorites
              </button>
            </div>
          </div>

          {/* Portfolio Companies */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: '#0a468f', margin: 0 }}>
                <FiBriefcase style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Portfolio Companies
              </h2>
              <button
                onClick={() => setShowInviteModal(true)}
                style={{ padding: '10px 18px', background: '#0a468f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FiPlus size={16} /> Invite a Company
              </button>
            </div>

            {inviteLoading ? (
              <p style={{ color: '#666' }}>Loading...</p>
            ) : invites.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
                No invites sent yet. Click "Invite a Company" to get started.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    {['Company Name', 'Email', 'Status', 'Invited'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: '#666', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invites.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '500' }}>{inv.companyName}</td>
                      <td style={{ padding: '10px 8px', color: '#666' }}>{inv.companyEmail}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                          background: inv.status === 'registered' ? '#d1fae5' : inv.status === 'expired' ? '#fee2e2' : '#fef3c7',
                          color: inv.status === 'registered' ? '#065f46' : inv.status === 'expired' ? '#991b1b' : '#92400e',
                        }}>
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#666' }}>
                        {new Date(inv.invitedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', width: '400px', maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0a468f' }}>Invite a Portfolio Company</h3>
            <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Company Name"
                value={inviteCompanyName}
                onChange={e => setInviteCompanyName(e.target.value)}
                required
                style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#93c5fd'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              <input
                type="email"
                placeholder="Company Email"
                value={inviteCompanyEmail}
                onChange={e => setInviteCompanyEmail(e.target.value)}
                required
                style={{ padding: '12px', fontSize: '14px', border: '2px solid #e0e0e0', borderRadius: '6px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#93c5fd'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
              {inviteError && <div style={{ color: 'red', fontSize: '13px', background: '#fee', padding: '8px 12px', borderRadius: '6px' }}>{inviteError}</div>}
              {inviteSuccess && <div style={{ color: 'green', fontSize: '13px', background: '#d4edda', padding: '8px 12px', borderRadius: '6px' }}>{inviteSuccess}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteSuccess(''); }}
                  style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#333' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  style={{ flex: 1, padding: '12px', background: inviteSubmitting ? '#93c5fd' : '#0a468f', color: 'white', border: 'none', borderRadius: '6px', cursor: inviteSubmitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  {inviteSubmitting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .mobile-overlay { display: block !important; }
          .sidebar {
            position: fixed !important;
            left: ${sidebarOpen ? '0' : '-280px'} !important;
            transition: left 0.3s ease;
            height: 100vh !important;
            width: 280px !important;
            min-width: 280px !important;
          }
          .main-content { padding: 80px 20px 40px 20px !important; margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
