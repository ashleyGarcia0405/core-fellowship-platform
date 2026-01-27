import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createInterview } from '../../lib/api';
import type { Recommendation } from '../../lib/api';

export default function InterviewForm() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().slice(0, 16));
  const [technicalScore, setTechnicalScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [motivationScore, setMotivationScore] = useState(5);
  const [cultureFitScore, setCultureFitScore] = useState(5);
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation>('YES');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createInterview(applicationId!, {
        interviewDate,
        technicalScore,
        communicationScore,
        motivationScore,
        cultureFitScore,
        strengths,
        concerns,
        notes,
        recommendation,
      });

      alert('Interview recorded successfully!');
      navigate('/admin/applications');
    } catch (err: any) {
      setError(err.message || 'Failed to record interview');
    } finally {
      setLoading(false);
    }
  };

  const ScoreSlider = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
        {label}: {value}/10
      </label>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>Record Interview</h1>
      <p>Application ID: {applicationId}</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Interview Date
          </label>
          <input
            type="datetime-local"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3 style={{ marginTop: '20px' }}>Scoring (1-10 scale)</h3>

        <ScoreSlider
          label="Technical Skills"
          value={technicalScore}
          onChange={setTechnicalScore}
        />

        <ScoreSlider
          label="Communication"
          value={communicationScore}
          onChange={setCommunicationScore}
        />

        <ScoreSlider
          label="Motivation & Drive"
          value={motivationScore}
          onChange={setMotivationScore}
        />

        <ScoreSlider
          label="Culture Fit"
          value={cultureFitScore}
          onChange={setCultureFitScore}
        />

        <div style={{
          padding: '15px',
          background: '#f0f0f0',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          Overall Score (calculated): {
            (technicalScore * 0.3 + communicationScore * 0.25 +
             motivationScore * 0.25 + cultureFitScore * 0.2).toFixed(1)
          }/10
        </div>

        <h3 style={{ marginTop: '20px' }}>Qualitative Assessment</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Strengths
          </label>
          <textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            rows={3}
            placeholder="What did the candidate excel at?"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Concerns
          </label>
          <textarea
            value={concerns}
            onChange={(e) => setConcerns(e.target.value)}
            rows={3}
            placeholder="Any red flags or areas of concern?"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Any other observations or context..."
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Recommendation
          </label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value as Recommendation)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value="STRONG_YES">Strong Yes - Highly recommend for finalist</option>
            <option value="YES">Yes - Recommend for finalist</option>
            <option value="MAYBE">Maybe - Borderline candidate</option>
            <option value="NO">No - Do not recommend</option>
          </select>
        </div>

        {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#ccc' : '#93c5fd',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {loading ? 'Saving...' : 'Record Interview'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/applications')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}