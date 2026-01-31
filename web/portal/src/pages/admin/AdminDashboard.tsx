import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiHome, FiUsers, FiBriefcase, FiSettings, FiLogOut } from 'react-icons/fi';
import {
  getAllApplications,
  updateApplicationStatus,
  exportApplicationsCSV,
  exportApplicationsJSON,
  getResumeSignedUrl,
  getStartups
} from '../../lib/api';
import type { Startup } from '../../lib/api';

interface Application {
  id: string;
  fullName?: string;
  companyName?: string;
  email: string;
  userType: 'STUDENT' | 'STARTUP';
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  term?: string;
  submittedAt: string;

  // Student fields
  pronouns?: string;
  gradYear?: string;
  graduationYear?: string;
  school?: string;
  major?: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  resumeUrl?: string;
  howDidYouHear?: string;
  referralSource?: string;
  rolePreferences?: string[];
  startupsAndIndustries?: string;
  contributionAndExperience?: string;
  workMode?: string;
  timeCommitment?: string;
  isUSCitizen?: string;
  workAuthorization?: string;
  additionalComments?: string;
  previouslyApplied?: boolean;
  previouslyParticipated?: boolean;
  hasUpcomingInternshipOffers?: boolean;

  // Startup fields
  industry?: string;
  stage?: string;
}

interface Stats {
  total: number;
  submitted: number;
  under_review: number;
  accepted: number;
  rejected: number;
}

interface StartupStats {
  total: number;
  submitted: number;
  approved: number;
  active: number;
  inactive: number;
}

const STATUS_STYLES = {
  submitted: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  under_review: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  accepted: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  rejected: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const STARTUP_STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  submitted: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  approved: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  active: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  inactive: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

const STARTUP_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  approved: 'Approved',
  active: 'Active',
  inactive: 'Inactive',
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'students' | 'startups'>('students');
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    submitted: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
  });
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [startupLoading, setStartupLoading] = useState(false);
  const [startupError, setStartupError] = useState('');
  const [startupSearchTerm, setStartupSearchTerm] = useState('');
  const [startupStatusFilter, setStartupStatusFilter] = useState('all');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [startupStats, setStartupStats] = useState<StartupStats>({
    total: 0,
    submitted: 0,
    approved: 0,
    active: 0,
    inactive: 0,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (activeTab === 'startups' && startups.length === 0) {
      loadStartups();
    }
  }, [activeTab]);

  useEffect(() => {
    filterStartups();
  }, [startups, startupSearchTerm, startupStatusFilter]);

  useEffect(() => {
    setSelectedApp(null);
    setSelectedStartup(null);
  }, [activeTab]);

  useEffect(() => {
    async function fetchResumeUrl() {
      if (selectedApp?.resumeUrl && selectedApp.userType === 'STUDENT') {
        try {
          const { signedUrl } = await getResumeSignedUrl(selectedApp.id);
          setResumeSignedUrl(signedUrl);
        } catch (err) {
          console.error('Failed to fetch resume URL:', err);
          setResumeSignedUrl(null);
        }
      } else {
        setResumeSignedUrl(null);
      }
    }
    fetchResumeUrl();
  }, [selectedApp]);

  async function loadApplications() {
    try {
      setLoading(true);
      const data = await getAllApplications();
      const normalized = data.map(app => ({
        ...app,
        userType: 'STUDENT',
      }));
      setApplications(normalized);
      calculateStats(normalized);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function loadStartups() {
    try {
      setStartupLoading(true);
      const data = await getStartups();
      setStartups(data);
      calculateStartupStats(data);
    } catch (err: any) {
      setStartupError(err.message || 'Failed to load startup intakes');
    } finally {
      setStartupLoading(false);
    }
  }

  function calculateStats(apps: Application[]) {
    setStats({
      total: apps.length,
      submitted: apps.filter(a => a.status === 'submitted').length,
      under_review: apps.filter(a => a.status === 'under_review').length,
      accepted: apps.filter(a => a.status === 'accepted').length,
      rejected: apps.filter(a => a.status === 'rejected').length,
    });
  }

  function calculateStartupStats(items: Startup[]) {
    setStartupStats({
      total: items.length,
      submitted: items.filter(s => s.status === 'submitted').length,
      approved: items.filter(s => s.status === 'approved').length,
      active: items.filter(s => s.status === 'active').length,
      inactive: items.filter(s => s.status === 'inactive').length,
    });
  }

  function filterApplications() {
    let filtered = [...applications];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        (app.fullName?.toLowerCase().includes(term)) ||
        (app.companyName?.toLowerCase().includes(term)) ||
        app.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.userType === typeFilter);
    }

    setFilteredApps(filtered);
  }

  function filterStartups() {
    let filtered = [...startups];

    if (startupSearchTerm) {
      const term = startupSearchTerm.toLowerCase();
      filtered = filtered.filter(startup =>
        (startup.companyName?.toLowerCase().includes(term)) ||
        (startup.contactName?.toLowerCase().includes(term)) ||
        (startup.contactEmail?.toLowerCase().includes(term))
      );
    }

    if (startupStatusFilter !== 'all') {
      filtered = filtered.filter(startup => startup.status === startupStatusFilter);
    }

    setFilteredStartups(filtered);
  }

  async function handleExportCSV() {
    try {
      const blob = await exportApplicationsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export CSV: ' + err.message);
    }
  }

  async function handleExportJSON() {
    try {
      const blob = await exportApplicationsJSON();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export JSON: ' + err.message);
    }
  }

  async function handleStatusChange(appId: string, newStatus: string) {
    try {
      await updateApplicationStatus(appId, newStatus as any);
      await loadApplications();
      setSelectedApp(null);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  }

  if (activeTab === 'students' && loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '20px', color: '#0a468f' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)' }}>
      {/* Sidebar */}
      <div style={{
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
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
          <img src="/core-fellowship.png" alt="CORE Logo" style={{ width: '160px', height: 'auto' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '15px', minHeight: 0 }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            ADMIN PORTAL
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiHome size={18} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('students')}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: activeTab === 'students' ? '#e8f4ff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'students' ? '#0a468f' : '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'students') e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'students') e.currentTarget.style.background = 'transparent';
              }}
            >
              <FiUsers size={18} /> Student Applications
            </button>
            <button
              onClick={() => setActiveTab('startups')}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: activeTab === 'startups' ? '#e8f4ff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'startups' ? '#0a468f' : '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'startups') e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'startups') e.currentTarget.style.background = 'transparent';
              }}
            >
              <FiBriefcase size={18} /> Startup Applications
            </button>
          </nav>
        </div>

        <div style={{ flexShrink: 0, paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>
            ACCOUNT
          </h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiSettings size={18} /> Settings
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dc3545',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fee'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiLogOut size={18} /> Log out
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }}>
        <div style={{ maxWidth: '1400px' }}>
          {activeTab === 'students' ? (
            <>
          <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>
            Student Applications
          </h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Review and manage student applications for CORE Fellowship.
          </p>

          {error && (
            <div style={{
              marginBottom: '20px',
              background: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '15px',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Total Applications</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0a468f', marginTop: '8px' }}>{stats.total}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Pending Review</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107', marginTop: '8px' }}>{stats.submitted}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Under Review</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8', marginTop: '8px' }}>{stats.under_review}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Accepted</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginTop: '8px' }}>{stats.accepted}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Rejected</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545', marginTop: '8px' }}>{stats.rejected}</div>
            </div>
          </div>

          {/* Filters and Export */}
          <div style={{
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '250px',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Types</option>
                <option value="STUDENT">Students</option>
                <option value="STARTUP">Startups</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleExportCSV}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Export CSV
              </button>
              <button
                onClick={handleExportJSON}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Export JSON
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div style={{
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Name
                    </th>
                    <th style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Type
                    </th>
                    <th style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Submitted
                    </th>
                    <th style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        color: '#999',
                        fontSize: '14px'
                      }}>
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                            {app.fullName || app.companyName}
                          </div>
                          {app.school && (
                            <div style={{ fontSize: '12px', color: '#999' }}>{app.school}</div>
                          )}
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '14px', color: '#666' }}>
                          {app.email}
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            background: app.userType === 'STUDENT' ? '#e8d5ff' : '#ffe8d5',
                            color: app.userType === 'STUDENT' ? '#7c3aed' : '#ea580c'
                          }}>
                            {app.userType}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '12px',
                            border: '1px solid',
                            background: STATUS_STYLES[app.status].bg,
                            color: STATUS_STYLES[app.status].color,
                            borderColor: STATUS_STYLES[app.status].border
                          }}>
                            {STATUS_LABELS[app.status]}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '14px', color: '#666' }}>
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <button
                            onClick={() => setSelectedApp(app)}
                            style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#0a468f',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>
                Startup Intake Submissions
              </h1>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                Review submitted startup intake forms and partnership details.
              </p>

              {startupError && (
                <div style={{
                  marginBottom: '20px',
                  background: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  {startupError}
                </div>
              )}

              {startupLoading ? (
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#0a468f'
                }}>
                  Loading startup intakes...
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                  }}>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Total Startups</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0a468f', marginTop: '8px' }}>{startupStats.total}</div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Submitted</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginTop: '8px' }}>{startupStats.submitted}</div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Approved</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginTop: '8px' }}>{startupStats.approved}</div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Active</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb', marginTop: '8px' }}>{startupStats.active}</div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Inactive</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginTop: '8px' }}>{startupStats.inactive}</div>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    padding: '25px',
                    marginBottom: '25px'
                  }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      <input
                        type="text"
                        placeholder="Search by company or contact..."
                        value={startupSearchTerm}
                        onChange={(e) => setStartupSearchTerm(e.target.value)}
                        style={{
                          flex: 1,
                          minWidth: '250px',
                          padding: '10px 15px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <select
                        value={startupStatusFilter}
                        onChange={(e) => setStartupStatusFilter(e.target.value)}
                        style={{
                          padding: '10px 15px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                            <th style={{
                              padding: '15px 20px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#666',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Company
                            </th>
                            <th style={{
                              padding: '15px 20px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#666',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Contact
                            </th>
                            <th style={{
                              padding: '15px 20px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#666',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Status
                            </th>
                            <th style={{
                              padding: '15px 20px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#666',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Submitted
                            </th>
                            <th style={{
                              padding: '15px 20px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#666',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStartups.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{
                                padding: '60px 20px',
                                textAlign: 'center',
                                color: '#999',
                                fontSize: '14px'
                              }}>
                                No startup intakes found
                              </td>
                            </tr>
                          ) : (
                            filteredStartups.map((startup) => {
                              const style = STARTUP_STATUS_STYLES[startup.status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
                              return (
                                <tr key={startup.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                  <td style={{ padding: '15px 20px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
                                      {startup.companyName || 'Unnamed Startup'}
                                    </div>
                                    {startup.industry && (
                                      <div style={{ fontSize: '12px', color: '#999' }}>{startup.industry}</div>
                                    )}
                                  </td>
                                  <td style={{ padding: '15px 20px' }}>
                                    <div style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>
                                      {startup.contactName || 'No contact name'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                      {startup.contactEmail || startup.email || 'No email'}
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px 20px' }}>
                                    <span style={{
                                      padding: '4px 12px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      borderRadius: '12px',
                                      border: '1px solid',
                                      background: style.bg,
                                      color: style.color,
                                      borderColor: style.border
                                    }}>
                                      {STARTUP_STATUS_LABELS[startup.status] || startup.status || 'Unknown'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '15px 20px', fontSize: '14px', color: '#666' }}>
                                    {startup.submittedAt ? new Date(startup.submittedAt).toLocaleDateString() : '—'}
                                  </td>
                                  <td style={{ padding: '15px 20px' }}>
                                    <button
                                      onClick={() => setSelectedStartup(startup)}
                                      style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#0a468f',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                      }}
                                    >
                                      View Intake
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '1400px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{
              background: 'white',
              borderBottom: '1px solid #e0e0e0',
              padding: '20px 25px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0a468f', marginBottom: '4px' }}>
                  {selectedApp.fullName || selectedApp.companyName}
                </h2>
                <p style={{ fontSize: '14px', color: '#666' }}>{selectedApp.email}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{
                  fontSize: '24px',
                  color: '#999',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Side - Application Details */}
              <div style={{
                flex: selectedApp.resumeUrl ? '0 0 60%' : '1',
                padding: '25px',
                overflow: 'auto'
              }}>
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
                          <a href={selectedApp.linkedinProfile} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0a468f', textDecoration: 'underline' }}>
                            {selectedApp.linkedinProfile}
                          </a>
                        </div>
                      )}
                      {selectedApp.portfolioWebsite && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Portfolio/Website</div>
                          <a href={selectedApp.portfolioWebsite} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#0a468f', textDecoration: 'underline' }}>
                            {selectedApp.portfolioWebsite}
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
                        <span key={idx} style={{
                          padding: '6px 12px',
                          background: '#e8f4ff',
                          color: '#0a468f',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
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
                    <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedApp.startupsAndIndustries}</p>
                  </div>
                )}

                {selectedApp.contributionAndExperience && (
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                      Contribution & Experience
                    </h3>
                    <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedApp.contributionAndExperience}</p>
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
                        <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedApp.additionalComments}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Actions */}
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px' }}>
                    Admin Actions
                  </h3>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Update Status</div>
                    <select
                      value={selectedApp.status}
                      onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Side - Resume Viewer */}
              {selectedApp.userType === 'STUDENT' && (
                <div style={{
                  flex: '0 0 40%',
                  borderLeft: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f8f9fa'
                }}>
                  <div style={{
                    padding: '20px 25px',
                    borderBottom: '1px solid #e0e0e0',
                    background: 'white'
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '10px' }}>
                      Resume
                    </h3>
                    {resumeSignedUrl ? (
                      <a
                        href={resumeSignedUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          background: '#0a468f',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          textDecoration: 'none'
                        }}
                      >
                        Download Resume
                      </a>
                    ) : selectedApp.resumeUrl ? (
                      <div style={{
                        padding: '8px 16px',
                        background: '#e3f2fd',
                        color: '#0a468f',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        Loading resume...
                      </div>
                    ) : (
                      <div style={{
                        padding: '8px 16px',
                        background: '#fee',
                        color: '#c33',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        No resume uploaded
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {resumeSignedUrl ? (
                      <iframe
                        src={resumeSignedUrl}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        title="Resume Preview"
                      />
                    ) : selectedApp.resumeUrl ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Loading resume...</div>
                        <div style={{ fontSize: '14px', color: '#999' }}>Please wait while we fetch the resume.</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
                        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#666' }}>No Resume Available</div>
                        <div style={{ fontSize: '14px' }}>This student hasn't uploaded a resume yet.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '1px solid #e0e0e0',
              padding: '15px 25px',
              background: '#f8f9fa',
              display: 'flex',
              justifyContent: 'flex-end',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              flexShrink: 0
            }}>
              <button
                onClick={() => setSelectedApp(null)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Startup Intake Detail Modal */}
      {selectedStartup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              background: 'white',
              borderBottom: '1px solid #e0e0e0',
              padding: '20px 25px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0a468f', marginBottom: '4px' }}>
                  {selectedStartup.companyName || 'Startup Intake'}
                </h2>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {selectedStartup.contactEmail || selectedStartup.email || 'No contact email'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStartup(null)}
                style={{
                  fontSize: '24px',
                  color: '#999',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '25px', overflow: 'auto' }}>
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                  Company Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Company Name</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.companyName || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Website</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.website || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Industry</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.industry || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Stage</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.stage || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Team Size</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.teamSize || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Founded Year</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.foundedYear || '—'}</div>
                  </div>
                </div>
                {selectedStartup.description && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Company Description</div>
                    <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {selectedStartup.description}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                  Contact Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Contact Name</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.contactName || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Contact Title</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.contactTitle || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Contact Email</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.contactEmail || selectedStartup.email || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Contact Phone</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.contactPhone || '—'}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                  Operating Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Operating Mode</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.operatingMode || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Time Zone</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.timeZone || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Intern Supervisor</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.internsSupervisor || '—'}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                  Internship Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Hired Interns Before</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      {selectedStartup.hasHiredInternsPreviously === undefined ? '—' : selectedStartup.hasHiredInternsPreviously ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Number of Interns</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.numberOfInternsNeeded ?? '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Will Pay Interns</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.willPayInterns || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Pay Amount</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.payAmount || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Looking for Permanent Intern</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.lookingForPermanentIntern || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Project Description URL</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.projectDescriptionUrl || '—'}</div>
                  </div>
                </div>

                {selectedStartup.positions && selectedStartup.positions.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Positions</div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedStartup.positions.map((position, index) => (
                        <div key={index} style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '12px',
                          background: '#f9fafb'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0a468f', marginBottom: '6px' }}>
                            {position.roleType || 'Role'} {position.timeCommitment ? `• ${position.timeCommitment}` : ''}
                          </div>
                          <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.6', marginBottom: '6px', whiteSpace: 'pre-wrap' }}>
                            {position.description || 'No description provided.'}
                          </div>
                          {position.requiredSkills && position.requiredSkills.length > 0 && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Skills: {position.requiredSkills.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                  Discovery & Commitment
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Referral Source</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.referralSource || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Commitment Acknowledged</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      {selectedStartup.commitmentAcknowledged === undefined ? '—' : selectedStartup.commitmentAcknowledged ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                  Administrative
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Term</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.term || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Status</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.status || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Submitted</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      {selectedStartup.submittedAt ? new Date(selectedStartup.submittedAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Last Updated</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      {selectedStartup.updatedAt ? new Date(selectedStartup.updatedAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Reviewed By</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedStartup.reviewedBy || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Review Notes</div>
                    <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>{selectedStartup.reviewNotes || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #e0e0e0',
              padding: '15px 25px',
              background: '#f8f9fa',
              display: 'flex',
              justifyContent: 'flex-end',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              flexShrink: 0
            }}>
              <button
                onClick={() => setSelectedStartup(null)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
