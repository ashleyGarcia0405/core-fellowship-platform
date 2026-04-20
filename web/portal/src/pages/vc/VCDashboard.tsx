import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiHome, FiUsers, FiStar, FiLogOut, FiMenu, FiX, FiSearch, FiDownload, FiExternalLink } from 'react-icons/fi';
import {
  getAllApplications,
  getVcFavorites,
  saveVcFavorite,
  removeVcFavorite,
  updateVcFavorite,
  exportVcFavoritesCsv,
  getInterview,
  getResumeSignedUrl,
} from '../../lib/api';
import type { VcFavorite, Interview } from '../../lib/api';

const ACTIVE_TERM = 'Spring 2026';

interface Application {
  id: string;
  fullName?: string;
  email: string;
  gradYear?: string;
  school?: string;
  major?: string;
  status: string;
  submittedAt: string;
  interviewEligible?: boolean;
  rolePreferences?: string[];
  pronouns?: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  resumeUrl?: string;
  workMode?: string;
  timeCommitment?: string;
  isUSCitizen?: string;
  workAuthorization?: string;
  startupsAndIndustries?: string;
  contributionAndExperience?: string;
  additionalComments?: string;
  howDidYouHear?: string;
  referralSource?: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  SUBMITTED: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  INTERVIEW_SCHEDULED: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  INTERVIEWED: { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' },
  FINALIST: { bg: '#fae8ff', color: '#86198f', border: '#e879f9' },
  REJECTED: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  MATCHED: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  NOT_MATCHED: { bg: '#fef3c7', color: '#78350f', border: '#fbbf24' },
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEWED: 'Interviewed',
  FINALIST: 'Finalist',
  REJECTED: 'Rejected',
  MATCHED: 'Matched',
  NOT_MATCHED: 'Not Matched',
};

export default function VCDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [favorites, setFavorites] = useState<VcFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<Interview | null>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [splitPercent, setSplitPercent] = useState(55);
  const [isResizing, setIsResizing] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Favorites note editing
  const [editingNotes, setEditingNotes] = useState('');
  const [editingPortfolioCompany, setEditingPortfolioCompany] = useState('');
  const [savingFavEdit, setSavingFavEdit] = useState(false);

  // Exporting
  const [exporting, setExporting] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const favoritesByAppId = favorites.reduce((acc, f) => {
    acc[f.applicationId] = f;
    return acc;
  }, {} as Record<string, VcFavorite>);

  const filteredApps = applications.filter(app => {
    if (showFavoritesOnly && !favoritesByAppId[app.id]) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        app.fullName?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.school?.toLowerCase().includes(q) ||
        app.major?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedIndex = selectedApp ? filteredApps.findIndex(a => a.id === selectedApp.id) : -1;
  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex >= 0 && selectedIndex < filteredApps.length - 1;
  const resumeGutter = '2.2vw';

  function selectAdjacentApplication(direction: -1 | 1) {
    if (!selectedApp || filteredApps.length === 0) return;
    const currentIndex = filteredApps.findIndex(app => app.id === selectedApp.id);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= filteredApps.length) return;
    setSelectedApp(filteredApps[nextIndex]);
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getAllApplications({ term: ACTIVE_TERM }), getVcFavorites()])
      .then(([apps, favs]) => {
        if (!mounted) return;
        setApplications(apps as Application[]);
        setFavorites(favs);
      })
      .catch(err => { if (mounted) setError(err.message || 'Failed to load data'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedApp) {
      setResumeSignedUrl(null);
      setInterviewData(null);
      return;
    }

    if (selectedApp.resumeUrl) {
      getResumeSignedUrl(selectedApp.id)
        .then(r => setResumeSignedUrl(r.signedUrl))
        .catch(() => setResumeSignedUrl(null));
    } else {
      setResumeSignedUrl(null);
    }

    const fav = favoritesByAppId[selectedApp.id];
    setEditingNotes(fav?.notes || '');
    setEditingPortfolioCompany(fav?.portfolioCompany || '');

    setInterviewLoading(true);
    setInterviewData(null);
    getInterview(selectedApp.id)
      .then(data => setInterviewData(data))
      .catch(() => setInterviewData(null))
      .finally(() => setInterviewLoading(false));
  }, [selectedApp?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedApp) return;
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (event.key === 'ArrowRight') { event.preventDefault(); selectAdjacentApplication(1); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); selectAdjacentApplication(-1); }
      else if (event.key === 'Escape') setSelectedApp(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApp, filteredApps]);

  // Resize drag
  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(70, Math.max(35, pct)));
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizing]);

  const handleToggleFavorite = async (app: Application) => {
    const isFav = !!favoritesByAppId[app.id];
    if (isFav) {
      await removeVcFavorite(app.id);
      setFavorites(prev => prev.filter(f => f.applicationId !== app.id));
    } else {
      const fav = await saveVcFavorite(app.id);
      setFavorites(prev => [...prev, fav]);
    }
  };

  const handleSaveFavNotes = async () => {
    if (!selectedApp) return;
    setSavingFavEdit(true);
    try {
      const isFav = !!favoritesByAppId[selectedApp.id];
      let updated: VcFavorite;
      if (isFav) {
        updated = await updateVcFavorite(selectedApp.id, { notes: editingNotes, portfolioCompany: editingPortfolioCompany });
      } else {
        updated = await saveVcFavorite(selectedApp.id, editingNotes, editingPortfolioCompany);
      }
      setFavorites(prev => {
        const filtered = prev.filter(f => f.applicationId !== selectedApp.id);
        return [...filtered, updated];
      });
    } finally {
      setSavingFavEdit(false);
    }
  };

  const handleExportShortlist = async () => {
    setExporting(true);
    try {
      const blob = await exportVcFavoritesCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vc-shortlist.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const navItems = [
    { icon: <FiHome size={18} />, label: 'Home', path: '/vc', active: false },
    { icon: <FiUsers size={18} />, label: 'Talent Directory', path: '/vc/talent', active: true },
    { icon: <FiStar size={18} />, label: 'My Favorites', path: '/vc/talent', active: false },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', position: 'relative' }}>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-menu-btn"
        style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1001, display: 'none', background: 'white', border: '2px solid #e0e0e0', borderRadius: '8px', padding: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        {sidebarOpen ? <FiX size={24} color="#0a468f" /> : <FiMenu size={24} color="#0a468f" />}
      </button>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="mobile-overlay"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'none' }} />
      )}

      {/* Sidebar */}
      <div style={{ width: '18%', minWidth: '220px', maxWidth: '280px', background: 'white', borderRight: '2px solid #e0e0e0', padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflow: 'hidden', boxSizing: 'border-box', zIndex: 1000 }} className="sidebar">
        <div style={{ marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
          <img src="/core-fellowship.png" alt="CORE Logo" style={{ width: '160px', height: 'auto' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '15px', minHeight: 0 }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>VC PORTAL</h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(({ icon, label, path, active }) => (
              <button
                key={label}
                onClick={() => { navigate(path); setSidebarOpen(false); }}
                style={{ padding: '10px 15px', textAlign: 'left', background: active ? '#e8f4ff' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: active ? '#0a468f' : '#333', display: 'flex', alignItems: 'center', gap: '10px' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {icon} {label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ flexShrink: 0, paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
          <button
            onClick={() => { handleLogout(); setSidebarOpen(false); }}
            style={{ padding: '10px 15px', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#dc3545', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiLogOut size={18} /> Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }} className="main-content">
        <div style={{ maxWidth: '1400px' }}>
          <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>Talent Directory</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Browse and save top student talent for your portfolio companies.</p>

          {error && (
            <div style={{ marginBottom: '20px', background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '15px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {/* Filters */}
          <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '25px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                <FiSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, school..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 15px 10px 36px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="INTERVIEWED">Interviewed</option>
                <option value="FINALIST">Finalist</option>
                <option value="REJECTED">Rejected</option>
                <option value="MATCHED">Matched</option>
                <option value="NOT_MATCHED">Not Matched</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                style={{
                  padding: '10px 20px', fontSize: '14px', fontWeight: '500',
                  background: showFavoritesOnly ? '#fef3c7' : 'white',
                  color: showFavoritesOnly ? '#92400e' : '#333',
                  border: `1px solid ${showFavoritesOnly ? '#fcd34d' : '#ddd'}`,
                  borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <FiStar size={14} /> {showFavoritesOnly ? `My Favorites (${favorites.length})` : 'My Favorites'}
              </button>
              {showFavoritesOnly && (
                <button
                  onClick={handleExportShortlist}
                  disabled={exporting}
                  style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500', background: exporting ? '#6b7280' : '#0a468f', color: 'white', border: 'none', borderRadius: '6px', cursor: exporting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiDownload size={14} /> {exporting ? 'Exporting...' : 'Export Shortlist'}
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading students...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>#</th>
                      <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                      <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                      <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                      <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted</th>
                      <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save</th>
                      <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                          No students found
                        </td>
                      </tr>
                    ) : (
                      filteredApps.map((app, index) => {
                        const isFav = !!favoritesByAppId[app.id];
                        const style = STATUS_STYLES[app.status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
                        return (
                          <tr key={app.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '15px 20px', fontSize: '14px', fontWeight: '500', color: '#999' }}>{index + 1}</td>
                            <td style={{ padding: '15px 20px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>{app.fullName || '—'}</div>
                              {app.school && <div style={{ fontSize: '12px', color: '#999' }}>{app.school}</div>}
                              {isFav && favoritesByAppId[app.id]?.portfolioCompany && (
                                <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '2px' }}>{favoritesByAppId[app.id].portfolioCompany}</div>
                              )}
                            </td>
                            <td style={{ padding: '15px 20px', fontSize: '14px', color: '#666' }}>{app.email}</td>
                            <td style={{ padding: '15px 20px' }}>
                              <span style={{ padding: '4px 12px', fontSize: '11px', fontWeight: '600', borderRadius: '12px', border: '1px solid', background: style.bg, color: style.color, borderColor: style.border }}>
                                {STATUS_LABELS[app.status] || app.status}
                              </span>
                            </td>
                            <td style={{ padding: '15px 20px', fontSize: '14px', color: '#666' }}>
                              {new Date(app.submittedAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '15px 20px' }}>
                              <button
                                onClick={() => handleToggleFavorite(app)}
                                title={isFav ? 'Unsave' : 'Save'}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isFav ? '#f59e0b' : '#ccc', fontSize: '20px', lineHeight: 1 }}
                              >
                                {isFav ? '★' : '☆'}
                              </button>
                            </td>
                            <td style={{ padding: '15px 20px' }}>
                              <button
                                onClick={() => setSelectedApp(app)}
                                style={{ fontSize: '14px', fontWeight: '500', color: '#0a468f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '1400px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            {/* Prev/Next arrows */}
            <button
              onClick={() => selectAdjacentApplication(-1)}
              disabled={!canGoPrev}
              aria-label="Previous student"
              style={{ position: 'absolute', left: '-46px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '18px', border: '1px solid #ddd', background: 'white', color: '#0a468f', cursor: 'pointer', opacity: canGoPrev ? 1 : 0.4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '20px' }}
            >
              ‹
            </button>
            <button
              onClick={() => selectAdjacentApplication(1)}
              disabled={!canGoNext}
              aria-label="Next student"
              style={{ position: 'absolute', right: '-46px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '18px', border: '1px solid #ddd', background: 'white', color: '#0a468f', cursor: 'pointer', opacity: canGoNext ? 1 : 0.4, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: '20px' }}
            >
              ›
            </button>

            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0a468f', marginBottom: '4px' }}>{selectedApp.fullName || '—'}</h2>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{selectedApp.email}</p>
                <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>
                  {selectedIndex >= 0 ? `${selectedIndex + 1} of ${filteredApps.length}` : '—'} · Use ← → to navigate
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => handleToggleFavorite(selectedApp)}
                  style={{
                    padding: '8px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', border: '1px solid',
                    background: favoritesByAppId[selectedApp.id] ? '#fef3c7' : 'white',
                    color: favoritesByAppId[selectedApp.id] ? '#92400e' : '#333',
                    borderColor: favoritesByAppId[selectedApp.id] ? '#fcd34d' : '#ddd',
                  }}
                >
                  {favoritesByAppId[selectedApp.id] ? '★ Saved' : '☆ Save'}
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  style={{ fontSize: '24px', color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: '0', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              style={{ display: 'flex', flex: 1, overflow: 'hidden', userSelect: isResizing ? 'none' : 'auto', paddingRight: resumeGutter, boxSizing: 'border-box' }}
            >
              {/* Left Side - Application Details */}
              <div style={{ flex: selectedApp.resumeUrl ? `0 0 ${splitPercent}%` : '1', padding: '2vw', overflow: 'auto' }}>

                {/* Personal Information */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                    Personal Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {selectedApp.pronouns && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Pronouns</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.pronouns}</div>
                      </div>
                    )}
                    {selectedApp.school && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>School</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.school}</div>
                      </div>
                    )}
                    {selectedApp.major && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Major</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.major}</div>
                      </div>
                    )}
                    {selectedApp.gradYear && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Graduation Year</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.gradYear}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                {(selectedApp.linkedinProfile || selectedApp.portfolioWebsite) && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                      Links
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedApp.linkedinProfile && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>LinkedIn</div>
                          <a href={selectedApp.linkedinProfile} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0a468f', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiExternalLink size={12} /> {selectedApp.linkedinProfile}
                          </a>
                        </div>
                      )}
                      {selectedApp.portfolioWebsite && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Portfolio/Website</div>
                          <a href={selectedApp.portfolioWebsite} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0a468f', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiExternalLink size={12} /> {selectedApp.portfolioWebsite}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Role Preferences */}
                {selectedApp.rolePreferences && selectedApp.rolePreferences.length > 0 && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                      Role Preferences
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedApp.rolePreferences.map((role, idx) => (
                        <span key={idx} style={{ padding: '6px 12px', background: '#e8f4ff', color: '#0a468f', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Short Answers */}
                {selectedApp.startupsAndIndustries && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                      Startups & Industries of Interest
                    </h3>
                    <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>{selectedApp.startupsAndIndustries}</p>
                  </div>
                )}

                {selectedApp.contributionAndExperience && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                      Contribution & Experience
                    </h3>
                    <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>{selectedApp.contributionAndExperience}</p>
                  </div>
                )}

                {/* Work Details */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                    Work Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {selectedApp.workMode && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Work Mode</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.workMode}</div>
                      </div>
                    )}
                    {selectedApp.timeCommitment && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Time Commitment</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.timeCommitment}</div>
                      </div>
                    )}
                    {selectedApp.isUSCitizen && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>US Citizen</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.isUSCitizen}</div>
                      </div>
                    )}
                    {selectedApp.workAuthorization && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Work Authorization</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.workAuthorization}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                {(selectedApp.howDidYouHear || selectedApp.referralSource || selectedApp.additionalComments) && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                      Additional Information
                    </h3>
                    {selectedApp.howDidYouHear && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>How did you hear about us?</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.howDidYouHear}</div>
                      </div>
                    )}
                    {selectedApp.referralSource && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Referral Source</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{selectedApp.referralSource}</div>
                      </div>
                    )}
                    {selectedApp.additionalComments && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Additional Comments</div>
                        <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>{selectedApp.additionalComments}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Summary (read-only) */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                    Interview Summary
                  </h3>
                  {interviewLoading ? (
                    <div style={{ color: '#666', fontSize: '14px' }}>Loading interview...</div>
                  ) : interviewData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {interviewData.recommendation && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Recommendation</div>
                          <div style={{ fontSize: '14px', color: '#333' }}>{interviewData.recommendation}</div>
                        </div>
                      )}
                      {interviewData.likelihoodToAccept && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Likelihood to Accept</div>
                          <div style={{ fontSize: '14px', color: '#333' }}>{interviewData.likelihoodToAccept}</div>
                        </div>
                      )}
                      {interviewData.bestFitRoleOrStartup && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Best Fit Role or Startup</div>
                          <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>{interviewData.bestFitRoleOrStartup}</div>
                        </div>
                      )}
                      {interviewData.commitmentConcerns && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Commitment Concerns</div>
                          <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>{interviewData.commitmentConcerns}</div>
                        </div>
                      )}
                      {(interviewData as any).skillsAndExperience && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Skills & Experience</div>
                          <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>{(interviewData as any).skillsAndExperience}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontSize: '14px' }}>No interview recorded yet.</div>
                  )}
                </div>

                {/* VC Private Notes */}
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#065f46', marginBottom: '15px' }}>My Notes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Portfolio Company</div>
                      <input
                        type="text"
                        placeholder="Which portfolio company?"
                        value={editingPortfolioCompany}
                        onChange={e => setEditingPortfolioCompany(e.target.value)}
                        style={{ width: '100%', padding: '10px 15px', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Private Notes</div>
                      <textarea
                        placeholder="Notes visible only to you..."
                        value={editingNotes}
                        onChange={e => setEditingNotes(e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: '10px 15px', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>
                    <button
                      onClick={handleSaveFavNotes}
                      disabled={savingFavEdit}
                      style={{ padding: '10px 20px', background: savingFavEdit ? '#6ee7b7' : '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: savingFavEdit ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', alignSelf: 'flex-start' }}
                    >
                      {savingFavEdit ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Drag handle */}
              {selectedApp.resumeUrl && (
                <div
                  onMouseDown={() => setIsResizing(true)}
                  style={{ width: '0.6vw', cursor: 'col-resize', background: 'transparent', position: 'relative', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', left: '0.25vw', top: '10%', bottom: '10%', width: '0.2vw', background: '#d1d5db', borderRadius: '2px' }} />
                </div>
              )}

              {/* Right Side - Resume Viewer */}
              {selectedApp.resumeUrl && (
                <div style={{ flex: `0 0 calc(${100 - splitPercent}% - ${resumeGutter})`, marginRight: resumeGutter, borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', background: '#f8f9fa', paddingRight: '0', boxSizing: 'border-box' }}>
                  <div style={{ padding: '0.6vw 1.2vw', borderBottom: '1px solid #e0e0e0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    {resumeSignedUrl ? (
                      <a
                        href={resumeSignedUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', padding: '4px 10px', background: '#0a468f', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '500', textDecoration: 'none' }}
                      >
                        Download Resume
                      </a>
                    ) : (
                      <div style={{ padding: '4px 10px', background: '#e3f2fd', color: '#0a468f', borderRadius: '6px', fontSize: '11px', fontWeight: '500' }}>
                        Loading resume...
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative', padding: '1.4vw 1.6vw', boxSizing: 'border-box' }}>
                    {resumeSignedUrl ? (
                      <iframe
                        src={resumeSignedUrl}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', background: 'white' }}
                        title="Resume Preview"
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Loading resume...</div>
                        <div style={{ fontSize: '14px', color: '#999' }}>Please wait while we fetch the resume.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e0e0e0', padding: '15px 25px', background: '#f8f9fa', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', flexShrink: 0 }}>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '500', color: '#333', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                Close
              </button>
            </div>
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
