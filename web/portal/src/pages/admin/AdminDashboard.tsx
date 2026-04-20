import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiHome, FiUsers, FiBriefcase, FiSettings, FiLogOut, FiMenu, FiX, FiCalendar, FiLink } from 'react-icons/fi';
import {
  getAllApplications,
  updateApplicationStatus,
  updateInterviewEligibility,
  exportApplicationsCSV,
  exportApplicationsJSON,
  getInterview,
  getResumeSignedUrl,
  getStartups,
  getAllSubmittedMatchPreferences,
  getAiRecommendation,
  generateAiRecommendation,
  assignMatchRole,
} from '../../lib/api';
import type { Startup, Interview, MatchPreference, AiRecommendation, RoleReference } from '../../lib/api';

const ACTIVE_TERM = 'Spring 2026';

interface Application {
  id: string;
  fullName?: string;
  companyName?: string;
  email: string;
  userType: 'STUDENT' | 'STARTUP';
  status: 'SUBMITTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'FINALIST' | 'REJECTED' | 'MATCHED' | 'NOT_MATCHED';
  term?: string;
  submittedAt: string;
  interviewEligible?: boolean;

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
  interview_scheduled: number;
  interviewed: number;
  finalist: number;
  rejected: number;
  matched: number;
  not_matched: number;
}

interface StartupStats {
  total: number;
  submitted: number;
  approved: number;
  active: number;
  inactive: number;
  totalRoles: number;
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


export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'startups' | 'matching'>('students');
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [interviewEligibilityFilter, setInterviewEligibilityFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [resumeSignedUrl, setResumeSignedUrl] = useState<string | null>(null);
  const [interviewSummary, setInterviewSummary] = useState<Interview | null>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [splitPercent, setSplitPercent] = useState(55);
  const [isResizing, setIsResizing] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    submitted: 0,
    interview_scheduled: 0,
    interviewed: 0,
    finalist: 0,
    rejected: 0,
    matched: 0,
    not_matched: 0,
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
    totalRoles: 0,
  });

  // Matching tab state
  const [matchPreferences, setMatchPreferences] = useState<MatchPreference[]>([]);
  const [matchStartups, setMatchStartups] = useState<Startup[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [selectedRole, setSelectedRole] = useState<{ startupId: string; positionIndex: number } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null); // applicationId
  const [aiRecommendations, setAiRecommendations] = useState<Record<string, AiRecommendation>>({});
  const [generatingRec, setGeneratingRec] = useState<string | null>(null); // applicationId currently generating
  const [matchApplications, setMatchApplications] = useState<Application[]>([]);
  const [assignDropdownOpen, setAssignDropdownOpen] = useState<string | null>(null); // applicationId
  const [assignSearch, setAssignSearch] = useState('');
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [reasoningModal, setReasoningModal] = useState<{
    applicationId: string;
    studentName: string;
    startupName: string;
    roleLabel: string;
    score: number;
    reasoning: string;
  } | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, interviewEligibilityFilter]);

  useEffect(() => {
    if (activeTab === 'startups' && startups.length === 0) {
      loadStartups();
    }
    if (activeTab === 'matching' && matchPreferences.length === 0) {
      loadMatchingData();
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
    if (!selectedApp) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        selectAdjacentApplication(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        selectAdjacentApplication(-1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApp, filteredApps]);

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

  useEffect(() => {
    async function fetchInterview() {
      if (!selectedApp || selectedApp.userType !== 'STUDENT') {
        setInterviewSummary(null);
        return;
      }
      try {
        setInterviewLoading(true);
        const interview = await getInterview(selectedApp.id);
        setInterviewSummary(interview);
      } catch (err: any) {
        setInterviewSummary(null);
      } finally {
        setInterviewLoading(false);
      }
    }
    fetchInterview();
  }, [selectedApp]);

  useEffect(() => {
    if (!isResizing) return;

    function handleMouseMove(event: MouseEvent) {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const rawPercent = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(70, Math.max(35, rawPercent));
      setSplitPercent(clamped);
    }

    function handleMouseUp() {
      setIsResizing(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  async function loadApplications() {
    try {
      setLoading(true);
      const data = await getAllApplications({ term: ACTIVE_TERM });
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
      const data = await getStartups({ term: ACTIVE_TERM });
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
      submitted: apps.filter(a => a.status === 'SUBMITTED').length,
      interview_scheduled: apps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
      interviewed: apps.filter(a => a.status === 'INTERVIEWED').length,
      finalist: apps.filter(a => a.status === 'FINALIST').length,
      rejected: apps.filter(a => a.status === 'REJECTED').length,
      matched: apps.filter(a => a.status === 'MATCHED').length,
      not_matched: apps.filter(a => a.status === 'NOT_MATCHED').length,
    });
  }

  function calculateStartupStats(items: Startup[]) {
    setStartupStats({
      total: items.length,
      submitted: items.filter(s => s.status === 'submitted').length,
      approved: items.filter(s => s.status === 'approved').length,
      active: items.filter(s => s.status === 'active').length,
      inactive: items.filter(s => s.status === 'inactive').length,
      totalRoles: items.reduce((sum, s) => sum + (s.positions?.length || 0), 0),
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

    if (interviewEligibilityFilter !== 'all') {
      filtered = filtered.filter(app =>
        interviewEligibilityFilter === 'eligible'
          ? !!app.interviewEligible
          : !app.interviewEligible
      );
    }

    setFilteredApps(filtered);
  }

  function selectAdjacentApplication(direction: -1 | 1) {
    if (!selectedApp || filteredApps.length === 0) return;
    const currentIndex = filteredApps.findIndex(app => app.id === selectedApp.id);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= filteredApps.length) return;
    setSelectedApp(filteredApps[nextIndex]);
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

  async function loadMatchingData() {
    try {
      setMatchLoading(true);
      setMatchError('');
      const [prefs, startupsData, appsData] = await Promise.all([
        getAllSubmittedMatchPreferences(ACTIVE_TERM),
        getStartups({ term: ACTIVE_TERM }),
        getAllApplications({ term: ACTIVE_TERM }),
      ]);
      setMatchPreferences(prefs);
      setMatchStartups(startupsData);
      setMatchApplications(appsData);

      // Load cached AI recommendations for each preference (404 = not generated yet)
      const recs: Record<string, AiRecommendation> = {};
      await Promise.all(
        prefs.map(async (pref) => {
          try {
            const rec = await getAiRecommendation(pref.applicationId);
            recs[pref.applicationId] = rec;
          } catch {
            // 404 = not generated yet, skip
          }
        })
      );
      setAiRecommendations(recs);
    } catch (err: any) {
      setMatchError(err.message || 'Failed to load matching data');
    } finally {
      setMatchLoading(false);
    }
  }

  async function handleGenerateAiRec(applicationId: string) {
    try {
      setGeneratingRec(applicationId);
      const rec = await generateAiRecommendation(applicationId);
      setAiRecommendations(prev => ({ ...prev, [applicationId]: rec }));
    } catch (err: any) {
      alert('Failed to generate AI recommendation: ' + err.message);
    } finally {
      setGeneratingRec(null);
    }
  }

  async function handleToggleAssign(applicationId: string, role: RoleReference) {
    const pref = matchPreferences.find(p => p.applicationId === applicationId);
    const isAssigned = pref?.matchedRoles?.some(
      r => r.startupId === role.startupId && r.positionIndex === role.positionIndex
    );
    try {
      const updated = await assignMatchRole(
        applicationId,
        isAssigned ? 'remove' : 'add',
        role
      );
      setMatchPreferences(prev => prev.map(p => p.applicationId === applicationId ? updated : p));
    } catch (err: any) {
      alert('Failed to update assignment: ' + err.message);
    }
  }

  function getAppForPref(pref: MatchPreference): Application | undefined {
    return matchApplications.find(a => a.id === pref.applicationId);
  }

  function getStartupName(startupId: string): string {
    return matchStartups.find(s => s.id === startupId)?.companyName || 'Startup';
  }

  // Build a flat list of all roles from startups
  // Build a display label that disambiguates duplicate role types within the same startup
  // e.g. two "Software Engineer" roles become "Software Engineer (1)" and "Software Engineer (2)"
  function getRoleDisplayLabel(startupId: string, positionIndex: number, roleType?: string): string {
    const startup = matchStartups.find(s => s.id === startupId);
    const resolvedRoleType = roleType || startup?.positions?.[positionIndex]?.roleType || 'Role';
    if (!startup?.positions) return resolvedRoleType;
    const sameTypeIndices = startup.positions
      .map((p, idx) => ({ idx, roleType: p.roleType }))
      .filter(p => p.roleType === resolvedRoleType);
    if (sameTypeIndices.length <= 1) return resolvedRoleType;
    const rank = sameTypeIndices.findIndex(p => p.idx === positionIndex) + 1;
    return `${resolvedRoleType} (${rank})`;
  }

  function getAllRoles(): { startupId: string; positionIndex: number; startupName: string; roleType: string; displayLabel: string; description: string }[] {
    const roles: { startupId: string; positionIndex: number; startupName: string; roleType: string; displayLabel: string; description: string }[] = [];
    for (const startup of matchStartups) {
      if (!startup.positions) continue;
      startup.positions.forEach((pos, idx) => {
        roles.push({
          startupId: startup.id,
          positionIndex: idx,
          startupName: startup.companyName,
          roleType: pos.roleType,
          displayLabel: getRoleDisplayLabel(startup.id, idx, pos.roleType),
          description: pos.description || '',
        });
      });
    }
    return roles;
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
      const data = await getAllApplications({ term: ACTIVE_TERM });
      const normalized = data.map(app => ({
        ...app,
        userType: 'STUDENT',
      }));
      setApplications(normalized);
      calculateStats(normalized);
      const updated = normalized.find(app => app.id === appId);
      if (updated) {
        setSelectedApp(updated);
      }
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  }

  async function handleInterviewEligibility(appId: string, eligible: boolean) {
    try {
      await updateInterviewEligibility(appId, eligible);
      const data = await getAllApplications({ term: ACTIVE_TERM });
      const normalized = data.map(app => ({
        ...app,
        userType: 'STUDENT',
      }));
      setApplications(normalized);
      calculateStats(normalized);
      const updated = normalized.find(app => app.id === appId);
      if (updated) {
        setSelectedApp(updated);
      }
    } catch (err: any) {
      alert('Failed to update interview eligibility: ' + err.message);
    }
  }

  const selectedIndex = selectedApp ? filteredApps.findIndex(app => app.id === selectedApp.id) : -1;
  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex >= 0 && selectedIndex < filteredApps.length - 1;
  const resumeGutter = '2.2vw';

  if (activeTab === 'students' && loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '20px', color: '#0a468f' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', position: 'relative' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <FiX size={24} color="#0a468f" /> : <FiMenu size={24} color="#0a468f" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          width: '280px',
          minWidth: '280px',
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
          zIndex: 1000
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
              onClick={() => {
                navigate('/admin');
                setSidebarOpen(false);
              }}
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
              onClick={() => {
                setActiveTab('students');
                setSidebarOpen(false);
              }}
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
              onClick={() => {
                setActiveTab('startups');
                setSidebarOpen(false);
              }}
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
            <button
              onClick={() => {
                setActiveTab('matching');
                setSidebarOpen(false);
              }}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: activeTab === 'matching' ? '#e8f4ff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'matching' ? '#0a468f' : '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'matching') e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'matching') e.currentTarget.style.background = 'transparent';
              }}
            >
              <FiLink size={18} /> Matching
            </button>
            <button
              onClick={() => {
                navigate('/admin/interviews');
                setSidebarOpen(false);
              }}
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
              <FiCalendar size={18} /> Interview Sign-Up
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
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
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
      <div className="main-content" style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }}>
        <div style={{ maxWidth: '1400px' }}>
          {activeTab === 'students' && (
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
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Total</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0a468f', marginTop: '8px' }}>{stats.total}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Submitted</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', marginTop: '8px' }}>{stats.submitted}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Interviewed</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3730a3', marginTop: '8px' }}>{stats.interviewed}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Finalist</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#86198f', marginTop: '8px' }}>{stats.finalist}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Matched</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#065f46', marginTop: '8px' }}>{stats.matched}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Rejected</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#991b1b', marginTop: '8px' }}>{stats.rejected}</div>
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
                <option value="SUBMITTED">Submitted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="INTERVIEWED">Interviewed</option>
                <option value="FINALIST">Finalist</option>
                <option value="REJECTED">Rejected</option>
                <option value="MATCHED">Matched</option>
                <option value="NOT_MATCHED">Not Matched</option>
              </select>
              <select
                value={interviewEligibilityFilter}
                onChange={(e) => setInterviewEligibilityFilter(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Interview Eligibility</option>
                <option value="eligible">Interview Eligible</option>
                <option value="not_eligible">Not Eligible</option>
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
                      letterSpacing: '0.5px',
                      width: '50px'
                    }}>
                      #
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
                    filteredApps.map((app, index) => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '15px 20px', fontSize: '14px', fontWeight: '500', color: '#999' }}>
                          {index + 1}
                        </td>
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
                          {(() => {
                            const style = STATUS_STYLES[app.status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
                            return (
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
                                {STATUS_LABELS[app.status] || app.status}
                              </span>
                            );
                          })()}
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
          )}
          {activeTab === 'startups' && (
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
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Total Roles</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed', marginTop: '8px' }}>{startupStats.totalRoles}</div>
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
                              letterSpacing: '0.5px',
                              width: '50px'
                            }}>
                              #
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
                              Roles
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
                            filteredStartups.map((startup, index) => {
                              return (
                                <tr key={startup.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                  <td style={{ padding: '15px 20px', fontSize: '14px', fontWeight: '500', color: '#999' }}>
                                    {index + 1}
                                  </td>
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
                                    {startup.positions && startup.positions.length > 0 ? (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {startup.positions.map((pos, i) => (
                                          <span key={i} style={{
                                            padding: '3px 10px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            borderRadius: '12px',
                                            background: '#e8f4ff',
                                            color: '#0a468f',
                                          }}>
                                            {pos.roleType}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '13px', color: '#999' }}>No roles</span>
                                    )}
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
          {activeTab === 'matching' && (
            <>
              <h1 style={{ fontSize: '32px', color: '#0a468f', marginBottom: '10px' }}>
                Student-Role Matching
              </h1>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                View student preferences, get AI-powered match suggestions, and assign students to roles.
              </p>

              {matchError && (
                <div style={{
                  marginBottom: '20px',
                  background: '#fee',
                  border: '1px solid #fcc',
                  color: '#c33',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  {matchError}
                </div>
              )}

              {matchLoading ? (
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#0a468f'
                }}>
                  Loading matching data...
                </div>
              ) : (
                <>
                  {/* Stats Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                  }}>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Roles Available</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0a468f', marginTop: '8px' }}>
                        {getAllRoles().length}
                      </div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Students with Prefs</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed', marginTop: '8px' }}>
                        {matchPreferences.length}
                      </div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Matched</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#065f46', marginTop: '8px' }}>
                        {matchPreferences.filter(p => p.matchedRoles && p.matchedRoles.length > 0).length}
                      </div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#666' }}>Unmatched</div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626', marginTop: '8px' }}>
                        {matchPreferences.filter(p => !p.matchedRoles || p.matchedRoles.length === 0).length}
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side: Roles (left) | Students (right) */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    {/* Left Panel - Roles */}
                    <div style={{
                      flex: '0 0 40%',
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      padding: '20px',
                      maxHeight: 'calc(100vh - 340px)',
                      overflow: 'auto'
                    }}>
                      <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px' }}>
                        Roles by Startup
                      </h2>
                      {(() => {
                        const grouped: Record<string, { startup: Startup; roles: { positionIndex: number; roleType: string; description: string }[] }> = {};
                        for (const startup of matchStartups) {
                          if (!startup.positions || startup.positions.length === 0) continue;
                          grouped[startup.id] = {
                            startup,
                            roles: startup.positions.map((pos, idx) => ({
                              positionIndex: idx,
                              roleType: pos.roleType,
                              description: pos.description || '',
                            }))
                          };
                        }
                        return Object.entries(grouped).map(([startupId, { startup, roles }]) => (
                          <div key={startupId} style={{ marginBottom: '18px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                              {startup.companyName}
                            </div>
                            {roles.map((role) => {
                              const isSelected = selectedRole?.startupId === startupId && selectedRole?.positionIndex === role.positionIndex;
                              const isHighlightedByStudent = selectedStudent != null && matchPreferences
                                .find(p => p.applicationId === selectedStudent)?.rankedRoles
                                .some(r => r.startupId === startupId && r.positionIndex === role.positionIndex);
                              const interestedCount = matchPreferences.filter(p =>
                                p.rankedRoles.some(r => r.startupId === startupId && r.positionIndex === role.positionIndex)
                              ).length;
                              const assignedPrefs = matchPreferences.filter(p =>
                                p.matchedRoles?.some(r => r.startupId === startupId && r.positionIndex === role.positionIndex)
                              );
                              const assignedApps = assignedPrefs.map(p => getAppForPref(p)).filter(Boolean);

                              return (
                                <div
                                  key={role.positionIndex}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedRole(null);
                                    } else {
                                      setSelectedRole({ startupId, positionIndex: role.positionIndex });
                                      setSelectedStudent(null);
                                    }
                                  }}
                                  style={{
                                    padding: '10px 12px',
                                    marginBottom: '6px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid #0a468f' : '1px solid #e0e0e0',
                                    background: isHighlightedByStudent ? '#fef9c3' : isSelected ? '#e8f4ff' : 'white',
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>{getRoleDisplayLabel(startupId, role.positionIndex, role.roleType)}</span>
                                      <span style={{
                                        marginLeft: '8px',
                                        fontSize: '11px',
                                        color: '#666',
                                        background: '#f3f4f6',
                                        padding: '2px 8px',
                                        borderRadius: '10px'
                                      }}>
                                        {interestedCount} interested
                                      </span>
                                    </div>
                                    {assignedApps.length > 0 && (
                                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {assignedApps.map((a, i) => (
                                          <span key={i} style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: '#065f46',
                                            background: '#d1fae5',
                                            padding: '2px 8px',
                                            borderRadius: '10px'
                                          }}>
                                            {a!.fullName}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Top students for this role (shown when selected) */}
                                  {isSelected && (() => {
                                    const totalStudents = matchPreferences.length;
                                    const scored: { appId: string; name: string; score: number; reasoning: string }[] = [];
                                    for (const pref of matchPreferences) {
                                      const rec = aiRecommendations[pref.applicationId];
                                      if (!rec) continue;
                                      const rs = rec.roleScores.find(
                                        s => s.startupId === startupId && s.positionIndex === role.positionIndex
                                      );
                                      if (rs) {
                                        const app = getAppForPref(pref);
                                        scored.push({
                                          appId: pref.applicationId,
                                          name: app?.fullName || 'Unknown',
                                          score: rs.score,
                                          reasoning: rs.reasoning,
                                        });
                                      }
                                    }
                                    scored.sort((a, b) => b.score - a.score);
                                    const top5 = scored.slice(0, 5);
                                    const scoredCount = Object.keys(aiRecommendations).length;

                                    return (
                                      <div style={{
                                        marginTop: '8px',
                                        padding: '10px 12px',
                                        background: '#f8fafc',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                      }}>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#0a468f', marginBottom: '6px' }}>
                                          Top Students for this Role
                                          <span style={{ fontWeight: '400', color: '#94a3b8', marginLeft: '6px' }}>
                                            ({scoredCount} of {totalStudents} scored)
                                          </span>
                                        </div>
                                        {top5.length === 0 ? (
                                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            No AI scores generated yet. Generate recs for students first.
                                          </div>
                                        ) : (
                                          top5.map((s, idx) => (
                                            <div key={s.appId} style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              padding: '4px 0',
                                              borderBottom: idx < top5.length - 1 ? '1px solid #e2e8f0' : 'none',
                                            }}>
                                              <span
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setReasoningModal({
                                                    applicationId: s.appId,
                                                    studentName: s.name,
                                                    startupName: startup.companyName,
                                                    roleLabel: getRoleDisplayLabel(startupId, role.positionIndex, role.roleType),
                                                    score: s.score,
                                                    reasoning: s.reasoning || 'No reasoning provided.',
                                                  });
                                                }}
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: '700',
                                                  color: s.score >= 8 ? '#065f46' : s.score >= 5 ? '#92400e' : '#991b1b',
                                                  background: s.score >= 8 ? '#d1fae5' : s.score >= 5 ? '#fef3c7' : '#fee2e2',
                                                  padding: '1px 7px',
                                                  borderRadius: '8px',
                                                  minWidth: '32px',
                                                  textAlign: 'center',
                                                  cursor: 'pointer',
                                                }}>
                                                {s.score}/10
                                              </span>
                                              <span style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                                                {s.name}
                                              </span>
                                              <span style={{ fontSize: '11px', color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                    title={s.reasoning}>
                                                {s.reasoning}
                                              </span>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              );
                            })}
                          </div>
                        ));
                      })()}
                      {matchStartups.filter(s => s.positions && s.positions.length > 0).length === 0 && (
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '14px' }}>
                          No startups with roles found
                        </div>
                      )}
                    </div>

                    {/* Right Panel - Students */}
                    <div style={{
                      flex: 1,
                      background: 'white',
                      borderRadius: '10px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      padding: '20px',
                      maxHeight: 'calc(100vh - 340px)',
                      overflow: 'auto'
                    }}>
                      <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px' }}>
                        Students with Preferences
                      </h2>
                      {matchPreferences.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '14px' }}>
                          No students have submitted preferences yet
                        </div>
                      ) : (
                        matchPreferences.map((pref) => {
                          const app = getAppForPref(pref);
                          const isSelected = selectedStudent === pref.applicationId;
                          const isHighlightedByRole = selectedRole != null && pref.rankedRoles.some(
                            r => r.startupId === selectedRole.startupId && r.positionIndex === selectedRole.positionIndex
                          );
                          const rec = aiRecommendations[pref.applicationId];
                          const isGenerating = generatingRec === pref.applicationId;
                          const allRoles = getAllRoles();

                          const isExpanded = expandedStudents.has(pref.applicationId);
                          return (
                            <div
                              key={pref.applicationId}
                              style={{
                                marginBottom: '8px',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #0a468f' : '1px solid #e0e0e0',
                                background: isHighlightedByRole ? '#fef9c3' : isSelected ? '#e8f4ff' : 'white',
                                transition: 'all 0.15s',
                                overflow: 'visible',
                              }}
                            >
                              {/* Collapsed header — always visible */}
                              <div
                                onClick={() => {
                                  // Toggle expand
                                  setExpandedStudents(prev => {
                                    const next = new Set(prev);
                                    if (next.has(pref.applicationId)) {
                                      next.delete(pref.applicationId);
                                    } else {
                                      next.add(pref.applicationId);
                                    }
                                    return next;
                                  });
                                  // Also set cross-highlight
                                  if (isSelected) {
                                    setSelectedStudent(null);
                                  } else {
                                    setSelectedStudent(pref.applicationId);
                                    setSelectedRole(null);
                                  }
                                }}
                                style={{
                                  padding: '10px 14px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', color: '#999', transition: 'transform 0.15s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
                                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                                    {app?.fullName || 'Unknown Student'}
                                  </span>
                                  {app?.school && (
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                      {app.school}
                                    </span>
                                  )}
                                  {app?.major && (
                                    <span style={{ fontSize: '12px', color: '#999' }}>
                                      · {app.major}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {rec && (
                                    <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '500' }}>
                                      AI
                                    </span>
                                  )}
                                  {pref.matchedRoles && pref.matchedRoles.length > 0 && (
                                    <span style={{
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      color: '#065f46',
                                      background: '#d1fae5',
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                    }}>
                                      {pref.matchedRoles.length} Match{pref.matchedRoles.length > 1 ? 'es' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Expanded body */}
                              {isExpanded && (
                                <div style={{ padding: '0 14px 14px 14px' }}>
                                  {/* Ranked preferences as pills */}
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                                    {pref.rankedRoles.map((role, idx) => (
                                      <span key={idx} style={{
                                        fontSize: '11px',
                                        padding: '3px 8px',
                                        borderRadius: '10px',
                                        background: '#f3f4f6',
                                        color: '#374151',
                                        fontWeight: '500',
                                      }}>
                                        #{idx + 1} {getStartupName(role.startupId)} - {getRoleDisplayLabel(role.startupId, role.positionIndex)}
                                      </span>
                                    ))}
                                  </div>

                                  {/* AI Recs + Generate button */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}
                                       onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleGenerateAiRec(pref.applicationId)}
                                      disabled={isGenerating}
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: 'white',
                                        background: isGenerating ? '#9ca3af' : '#7c3aed',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '5px 12px',
                                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isGenerating ? 'Generating...' : rec ? 'Regenerate AI Recs' : 'Generate AI Recs'}
                                    </button>
                                    {rec && (
                                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {rec.roleScores.map((rs, idx) => (
                                          <span
                                            key={idx}
                                            onClick={() => {
                                              setReasoningModal({
                                                applicationId: pref.applicationId,
                                                studentName: app?.fullName || 'Unknown Student',
                                                startupName: rs.startupName || 'Startup',
                                                roleLabel: getRoleDisplayLabel(rs.startupId, rs.positionIndex, rs.roleType),
                                                score: rs.score,
                                                reasoning: rs.reasoning || 'No reasoning provided.',
                                              });
                                            }}
                                            style={{
                                              fontSize: '11px',
                                              padding: '2px 8px',
                                              borderRadius: '10px',
                                              background: rs.score >= 8 ? '#d1fae5' : rs.score >= 5 ? '#fef3c7' : '#fee2e2',
                                              color: rs.score >= 8 ? '#065f46' : rs.score >= 5 ? '#92400e' : '#991b1b',
                                              fontWeight: '600',
                                              cursor: 'pointer',
                                            }}
                                            title={rs.reasoning}
                                          >
                                            {rs.startupName} - {getRoleDisplayLabel(rs.startupId, rs.positionIndex, rs.roleType)}: {rs.score}/10
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Assign roles — searchable dropdown */}
                                  <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Assigned Roles:</label>
                                    {/* Show assigned role chips */}
                                    {pref.matchedRoles && pref.matchedRoles.length > 0 && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
                                        {pref.matchedRoles.map((r) => (
                                          <span
                                            key={`${r.startupId}::${r.positionIndex}`}
                                            style={{
                                              fontSize: '11px',
                                              padding: '3px 8px',
                                              borderRadius: '12px',
                                              border: '1.5px solid #065f46',
                                              background: '#d1fae5',
                                              color: '#065f46',
                                              fontWeight: '600',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                            }}
                                          >
                                            {getStartupName(r.startupId)} - {getRoleDisplayLabel(r.startupId, r.positionIndex)}
                                            <button
                                              onClick={() => handleToggleAssign(pref.applicationId, r)}
                                              style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#065f46',
                                                fontSize: '13px',
                                                padding: '0 2px',
                                                lineHeight: 1,
                                              }}
                                              title="Remove"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {/* Search input */}
                                    <input
                                      type="text"
                                      placeholder="Search roles to assign..."
                                      value={assignDropdownOpen === pref.applicationId ? assignSearch : ''}
                                      onFocus={() => { setAssignDropdownOpen(pref.applicationId); setAssignSearch(''); }}
                                      onBlur={() => { setTimeout(() => { setAssignDropdownOpen(null); setAssignSearch(''); }, 200); }}
                                      onChange={(e) => setAssignSearch(e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                      }}
                                    />
                                    {/* Dropdown results — only show when typing */}
                                    {assignDropdownOpen === pref.applicationId && assignSearch.length > 0 && (() => {
                                      const search = assignSearch.toLowerCase();
                                      const filtered = allRoles.filter(role => {
                                        const alreadyAssigned = pref.matchedRoles?.some(
                                          r => r.startupId === role.startupId && r.positionIndex === role.positionIndex
                                        );
                                        if (alreadyAssigned) return false;
                                        const label = `${role.startupName} - ${role.displayLabel}`.toLowerCase();
                                        return label.includes(search);
                                      });
                                      if (filtered.length === 0) return null;
                                      return (
                                        <div style={{
                                          position: 'absolute',
                                          top: '100%',
                                          left: 0,
                                          right: 0,
                                          background: 'white',
                                          border: '1px solid #d1d5db',
                                          borderRadius: '6px',
                                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                          maxHeight: '160px',
                                          overflowY: 'auto',
                                          zIndex: 50,
                                        }}>
                                          {filtered.map((role) => (
                                            <div
                                              key={`${role.startupId}::${role.positionIndex}`}
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleToggleAssign(pref.applicationId, {
                                                  startupId: role.startupId,
                                                  positionIndex: role.positionIndex,
                                                });
                                                setAssignSearch('');
                                              }}
                                              style={{
                                                padding: '6px 10px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f3f4f6',
                                              }}
                                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                                              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                                            >
                                              {role.startupName} - {role.displayLabel}
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
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
            position: 'relative',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <button
              onClick={() => selectAdjacentApplication(-1)}
              disabled={!canGoPrev}
              aria-label="Previous application"
              style={{
                position: 'absolute',
                left: '-46px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: '1px solid #ddd',
                background: 'white',
                color: '#0a468f',
                cursor: 'pointer',
                opacity: canGoPrev ? 1 : 0.4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              ‹
            </button>
            <button
              onClick={() => selectAdjacentApplication(1)}
              disabled={!canGoNext}
              aria-label="Next application"
              style={{
                position: 'absolute',
                right: '-46px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                border: '1px solid #ddd',
                background: 'white',
                color: '#0a468f',
                cursor: 'pointer',
                opacity: canGoNext ? 1 : 0.4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              ›
            </button>
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
                <p style={{ fontSize: '12px', color: '#999' }}>
                  {selectedIndex >= 0 ? `${selectedIndex + 1} of ${filteredApps.length}` : '—'} · Use ← → to navigate
                </p>
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
            <div
              ref={contentRef}
              style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden',
                userSelect: isResizing ? 'none' : 'auto',
                paddingRight: resumeGutter,
                boxSizing: 'border-box'
              }}
            >
              {/* Left Side - Application Details */}
              <div style={{
                flex: selectedApp.resumeUrl ? `0 0 ${splitPercent}%` : '1',
                padding: '2vw',
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

                {/* Interview Summary */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px', borderBottom: '2px solid #93c5fd', paddingBottom: '8px' }}>
                    Interview Summary
                  </h3>
                  {interviewLoading ? (
                    <div style={{ color: '#666' }}>Loading interview...</div>
                  ) : interviewSummary ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Recommendation</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>
                          {interviewSummary.recommendation}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Likelihood to Accept</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>
                          {interviewSummary.likelihoodToAccept || '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Primary Role Interest</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>
                          {interviewSummary.primaryRoleInterest || '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Role Structure Preference</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>
                          {interviewSummary.roleStructurePreference || '—'}
                        </div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Best Fit Role or Startup</div>
                        <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>
                          {interviewSummary.bestFitRoleOrStartup || '—'}
                        </div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Commitment Concerns</div>
                        <div style={{ fontSize: '14px', color: '#333', whiteSpace: 'pre-wrap' }}>
                          {interviewSummary.commitmentConcerns || '—'}
                        </div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <button
                          onClick={() => navigate(`/admin/interview/${selectedApp.id}`)}
                          style={{
                            marginTop: '10px',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid #0a468f',
                            background: 'white',
                            color: '#0a468f',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {interviewSummary ? 'Edit Interview' : 'Record Interview'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#666' }}>
                      No interview recorded yet.
                      <div>
                        <button
                          onClick={() => navigate(`/admin/interview/${selectedApp.id}`)}
                          style={{
                            marginTop: '10px',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            border: '1px solid #0a468f',
                            background: 'white',
                            color: '#0a468f',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Record Interview
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0a468f', marginBottom: '15px' }}>
                    Admin Actions
                  </h3>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>Interview Eligibility</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!!selectedApp.interviewEligible}
                        onChange={(e) => handleInterviewEligibility(selectedApp.id, e.target.checked)}
                      />
                      <span style={{ fontSize: '14px', color: '#333' }}>Approved for interview</span>
                    </label>
                  </div>
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
                      <option value="SUBMITTED">Submitted</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="INTERVIEWED">Interviewed</option>
                      <option value="FINALIST">Finalist</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="MATCHED">Matched</option>
                      <option value="NOT_MATCHED">Not Matched</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Side - Resume Viewer */}
              {selectedApp.userType === 'STUDENT' && (
                <div
                  onMouseDown={() => setIsResizing(true)}
                  style={{
                    width: '0.6vw',
                    cursor: 'col-resize',
                    background: 'transparent',
                    position: 'relative',
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: '0.25vw',
                    top: '10%',
                    bottom: '10%',
                    width: '0.2vw',
                    background: '#d1d5db',
                    borderRadius: '2px'
                  }} />
                </div>
              )}

              {selectedApp.userType === 'STUDENT' && (
                <div style={{
                  flex: `0 0 calc(${100 - splitPercent}% - ${resumeGutter})`,
                  marginRight: resumeGutter,
                  borderLeft: '1px solid #e0e0e0',
                  borderRight: '1px solid #e0e0e0',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#f8f9fa',
                  paddingRight: '0',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    padding: '0.6vw 1.2vw',
                    borderBottom: '1px solid #e0e0e0',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}>
                    {resumeSignedUrl ? (
                      <a
                        href={resumeSignedUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          background: '#0a468f',
                          color: 'white',
                          borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        textDecoration: 'none'
                      }}
                    >
                      Download Resume
                      </a>
                    ) : selectedApp.resumeUrl ? (
                      <div style={{
                        padding: '4px 10px',
                        background: '#e3f2fd',
                        color: '#0a468f',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        Loading resume...
                      </div>
                    ) : (
                      <div style={{
                        padding: '4px 10px',
                        background: '#fee',
                        color: '#c33',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        No resume uploaded
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative', padding: '1.4vw 1.6vw', boxSizing: 'border-box' }}>
                    {resumeSignedUrl ? (
                      <iframe
                        src={resumeSignedUrl}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                          background: 'white'
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

      {/* Responsive Styles */}
      {reasoningModal && (
        <div
          onClick={() => setReasoningModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px, 100%)',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
              padding: '22px 24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                AI Reasoning
              </div>
              <button
                onClick={() => setReasoningModal(null)}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#0f172a',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Close
              </button>
            </div>
            <div style={{ marginTop: '14px', display: 'grid', gap: '8px', fontSize: '13px', color: '#475569' }}>
              <div><span style={{ fontWeight: '600', color: '#0f172a' }}>Student:</span> {reasoningModal.studentName}</div>
              <div><span style={{ fontWeight: '600', color: '#0f172a' }}>Startup:</span> {reasoningModal.startupName}</div>
              <div><span style={{ fontWeight: '600', color: '#0f172a' }}>Role:</span> {reasoningModal.roleLabel}</div>
              <div><span style={{ fontWeight: '600', color: '#0f172a' }}>Score:</span> {reasoningModal.score}/10</div>
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              fontSize: '13px',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}>
              {reasoningModal.reasoning}
            </div>
          </div>
        </div>
      )}
      <style>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
          .mobile-overlay {
            display: block;
          }
          .sidebar {
            position: fixed !important;
            left: ${sidebarOpen ? '0' : '-280px'};
            transition: left 0.3s ease;
            height: 100vh !important;
            width: 280px !important;
            min-width: 280px !important;
          }
          .main-content {
            padding: 80px 20px 40px 20px !important;
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
