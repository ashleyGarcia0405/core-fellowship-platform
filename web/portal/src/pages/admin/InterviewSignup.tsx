import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiFilter, FiUserPlus, FiUserMinus, FiHome, FiUsers, FiBriefcase, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getInterviewBookings, updateInterviewBooking } from '../../lib/api';

const TERMS = ['Summer 2026', 'Spring 2026'];

type InterviewStatusFilter = 'all' | 'scheduled' | 'completed';
type InterviewTypeFilter = 'all' | 'technical' | 'non-technical';
type AssignmentFilter = 'all' | 'needs-interviewer' | 'fully-assigned';

export default function InterviewSignup() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);
  const [statusFilter, setStatusFilter] = useState<InterviewStatusFilter>('scheduled');
  const [typeFilter, setTypeFilter] = useState<InterviewTypeFilter>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('all');

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        setError('');
        const data = await getInterviewBookings(selectedTerm);
        setBookings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load interview bookings.');
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [selectedTerm]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (booking.status === 'cancelled') return false;
        if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
        if (typeFilter !== 'all' && booking.interviewType !== typeFilter) return false;
        if (assignmentFilter === 'needs-interviewer' && booking.interviewers.length > 0) return false;
        if (assignmentFilter === 'fully-assigned' && booking.interviewers.length < 2) return false;
        return true;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings, statusFilter, typeFilter, assignmentFilter]);

  async function handleClaim(bookingId: string) {
    try {
      const updated = await updateInterviewBooking(bookingId, { addInterviewer: true });
      setBookings((prev) => prev.map(b => (b.id === bookingId ? updated : b)));
    } catch (err: any) {
      alert(err.message || 'Failed to claim interview slot.');
    }
  }

  async function handleUnclaim(bookingId: string) {
    try {
      const updated = await updateInterviewBooking(bookingId, { removeInterviewer: true });
      setBookings((prev) => prev.map(b => (b.id === bookingId ? updated : b)));
    } catch (err: any) {
      alert(err.message || 'Failed to unclaim interview slot.');
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-blue)', position: 'relative' }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          display: 'none',
          background: 'white',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <FiX size={24} color="#0a468f" /> : <FiMenu size={24} color="#0a468f" />}
      </button>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      <div
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
        }}
        className="sidebar"
      >
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
                navigate('/admin/applications');
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
              <FiUsers size={18} /> Student Applications
            </button>
            <button
              onClick={() => {
                navigate('/admin/applications');
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
              <FiBriefcase size={18} /> Startup Applications
            </button>
            <button
              onClick={() => {
                setSidebarOpen(false);
              }}
              style={{
                padding: '10px 15px',
                textAlign: 'left',
                background: '#e8f4ff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#0a468f',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
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

      <div style={{ flex: 1, padding: '40px 60px', overflow: 'auto' }} className="main-content">
        <div style={{ maxWidth: '1200px' }}>
          <h1 style={{ fontSize: '28px', color: '#0a468f', marginBottom: '8px' }}>
            Interview Sign-Up — {selectedTerm}
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Claim interviews to join, and keep coverage balanced across technical and non-technical slots.
          </p>

          {error && (
            <div style={{ marginBottom: '20px', background: '#fee', border: '1px solid #fcc', color: '#c33', padding: '12px 16px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#0a468f' }}>
              <FiFilter size={16} /> Filters
            </div>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '2px solid #0a468f', fontWeight: '600', color: '#0a468f' }}
            >
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InterviewStatusFilter)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as InterviewTypeFilter)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="all">All Types</option>
              <option value="technical">Technical</option>
              <option value="non-technical">Non-technical</option>
            </select>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as AssignmentFilter)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="all">All Coverage</option>
              <option value="needs-interviewer">Needs Interviewer</option>
              <option value="fully-assigned">Fully Assigned</option>
            </select>
          </div>

          {loading ? (
            <div style={{
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              padding: '40px',
              textAlign: 'center',
              color: '#0a468f'
            }}>
              Loading interview bookings...
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f5f5f5' }}>
                  <tr>
                    <th style={{ padding: '12px 8px 12px 12px', textAlign: 'left', fontSize: '12px', color: '#666', width: '40px' }}>#</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Time</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Student</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Interviewers</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#666' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No interview bookings match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking, index) => {
                      const start = new Date(booking.startTime);
                      const end = new Date(booking.endTime);
                      const isAssigned = booking.interviewers.some((i: any) => i.userId === user?.userId);
                      const canClaim = booking.interviewers.length < 2 && !isAssigned;
                      const canUnclaim = isAssigned;
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '14px 8px 14px 12px', fontSize: '14px', color: '#999', fontWeight: '500' }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '14px', color: '#333' }}>
                            {start.toLocaleDateString()}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#333' }}>
                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#333' }}>
                            <div style={{ fontWeight: '600' }}>{booking.studentName}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{booking.studentEmail}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#0a468f', fontWeight: '600' }}>
                            {booking.interviewType === 'technical' ? 'Technical' : 'Non-technical'}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#666' }}>
                            {booking.status}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#333' }}>
                            {booking.interviewers.length === 0 ? (
                              <span style={{ color: '#d97706', fontWeight: '600' }}>Needs interviewer</span>
                            ) : (
                              booking.interviewers.map((i: any) => i.name).join(', ')
                            )}
                            <div style={{ marginTop: '6px', fontSize: '11px', color: '#666' }}>
                              {booking.interviewers.length}/2 interviewers
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => (isAssigned ? handleUnclaim(booking.id) : handleClaim(booking.id))}
                              disabled={!canClaim && !canUnclaim}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: `1px solid ${isAssigned ? '#dc3545' : '#0a468f'}`,
                                background: isAssigned
                                  ? (canUnclaim ? 'white' : '#e5e7eb')
                                  : (canClaim ? '#0a468f' : '#e5e7eb'),
                                color: isAssigned
                                  ? (canUnclaim ? '#dc3545' : '#666')
                                  : (canClaim ? 'white' : '#666'),
                                cursor: canClaim || canUnclaim ? 'pointer' : 'not-allowed',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {isAssigned ? <FiUserMinus size={14} /> : <FiUserPlus size={14} />}
                              {isAssigned ? 'Unclaim slot' : 'Claim slot'}
                            </button>
                            <button
                              onClick={() => booking.applicationId && navigate(`/admin/interview/${booking.applicationId}`)}
                              disabled={!booking.applicationId}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #0a468f',
                                background: booking.applicationId ? 'white' : '#e5e7eb',
                                color: booking.applicationId ? '#0a468f' : '#666',
                                cursor: booking.applicationId ? 'pointer' : 'not-allowed',
                                fontSize: '12px'
                              }}
                            >
                              Record interview
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

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .sidebar {
            position: fixed !important;
            left: ${sidebarOpen ? '0' : '-280px'} !important;
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
