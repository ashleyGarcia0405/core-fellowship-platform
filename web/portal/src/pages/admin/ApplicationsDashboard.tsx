import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications } from '../../lib/api';
import type { StudentApplication } from '../../lib/api';

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  const loadApplications = async () => {
    try {
      const data = await getApplications();
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

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ fontWeight: 'bold' }}>Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px', fontSize: '14px', minWidth: '150px' }}
        >
          <option value="all">All Applications</option>
          <option value="submitted">Submitted</option>
          <option value="interviewed">Interviewed</option>
          <option value="finalist">Finalist</option>
          <option value="rejected">Rejected</option>
          <option value="matched">Matched</option>
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
                <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No applications found
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #dee2e6' }}>
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
                      disabled={app.status === 'interviewed' || app.status === 'finalist'}
                      style={{
                        padding: '6px 12px',
                        fontSize: '14px',
                        cursor: app.status === 'interviewed' || app.status === 'finalist' ? 'not-allowed' : 'pointer',
                        background: app.status === 'interviewed' || app.status === 'finalist' ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      {app.status === 'interviewed' || app.status === 'finalist' ? 'Interviewed' : 'Interview'}
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#54a1ff' }}>
              {applications.length}
            </div>
            <div style={{ color: '#666' }}>Total Applications</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {applications.filter(a => a.status === 'interviewed').length}
            </div>
            <div style={{ color: '#666' }}>Interviewed</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {applications.filter(a => a.status === 'submitted').length}
            </div>
            <div style={{ color: '#666' }}>Pending Interview</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
              {applications.filter(a => a.status === 'finalist').length}
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
    case 'submitted':
      return '#ffc107';
    case 'interviewed':
      return '#28a745';
    case 'finalist':
      return '#17a2b8';
    case 'matched':
      return '#54a1ff';
    case 'rejected':
      return '#dc3545';
    default:
      return '#6c757d';
  }
}