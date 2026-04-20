import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllApplications } from '../../lib/api';
import type { StudentApplication } from '../../lib/api';

const ACTIVE_TERM = 'Spring 2026';

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [term, setTerm] = useState(ACTIVE_TERM);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications(term);
  }, [term]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  const loadApplications = async (selectedTerm: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllApplications({ term: selectedTerm });
      setApplications(data);
      setFilteredApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewClick = (applicationId: string) => {
    navigate(`/admin/interview/${applicationId}`);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Applications Dashboard</h1>
        <button
          onClick={() => navigate('/admin')}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Back to Admin Portal
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 'bold' }}>Cohort:</label>
        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          style={{ padding: '8px', fontSize: '14px', minWidth: '160px' }}
        >
          <option value="Spring 2026">Spring 2026</option>
          <option value="Summer 2026">Summer 2026</option>
          <option value="Fall 2026">Fall 2026</option>
          <option value="Spring 2027">Spring 2027</option>
        </select>
        <label style={{ fontWeight: 'bold' }}>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px', minWidth: '150px' }}
        >
          <option value="all">All Applications</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="INTERVIEWED">Interviewed</option>
          <option value="FINALIST">Finalist</option>
          <option value="REJECTED">Rejected</option>
          <option value="MATCHED">Matched</option>
          <option value="NOT_MATCHED">Not Matched</option>
        </select>
        <span style={{ marginLeft: '10px', color: '#666' }}>
          Showing {filteredApplications.length} of {applications.length} applications
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left', width: '50px' }}>#</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Grad Year</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Major</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Submitted</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No applications found
                </td>
              </tr>
            ) : (
              filteredApplications.map((app, index) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', color: '#999', fontWeight: '500' }}>{index + 1}</td>
                  <td style={{ padding: '12px' }}>{app.fullName}</td>
                  <td style={{ padding: '12px' }}>{app.email}</td>
                  <td style={{ padding: '12px' }}>{app.gradYear}</td>
                  <td style={{ padding: '12px' }}>{app.major}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: getStatusColor(app.status),
                      color: 'white'
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleInterviewClick(app.id)}
                      disabled={app.status === 'INTERVIEWED' || app.status === 'FINALIST'}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        cursor: app.status === 'INTERVIEWED' || app.status === 'FINALIST' ? 'not-allowed' : 'pointer',
                        background: app.status === 'INTERVIEWED' || app.status === 'FINALIST' ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      {app.status === 'INTERVIEWED' || app.status === 'FINALIST' ? 'Interviewed' : 'Interview'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
        <h3 style={{ marginTop: 0 }}>Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#93c5fd' }}>
              {applications.length}
            </div>
            <div style={{ color: '#666' }}>Total Applications</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {applications.filter(a => a.status === 'INTERVIEWED').length}
            </div>
            <div style={{ color: '#666' }}>Interviewed</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {applications.filter(a => a.status === 'SUBMITTED').length}
            </div>
            <div style={{ color: '#666' }}>Pending Interview</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
              {applications.filter(a => a.status === 'FINALIST').length}
            </div>
            <div style={{ color: '#666' }}>Finalists</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'SUBMITTED':
      return '#ffc107';
    case 'INTERVIEW_SCHEDULED':
      return '#fd7e14';
    case 'INTERVIEWED':
      return '#28a745';
    case 'FINALIST':
      return '#17a2b8';
    case 'MATCHED':
      return '#93c5fd';
    case 'REJECTED':
      return '#dc3545';
    case 'NOT_MATCHED':
      return '#6c757d';
    default:
      return '#6c757d';
  }
}