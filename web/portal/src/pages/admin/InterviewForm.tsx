import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createInterview, getApplications, getInterview, getInterviewBookings, updateInterview } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Interview, Recommendation, UpdateInterviewRequest } from '../../lib/api';

export default function InterviewForm() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [primaryRoleInterest, setPrimaryRoleInterest] = useState('');
  const [secondaryRoleInterest, setSecondaryRoleInterest] = useState('');
  const [roleStructurePreference, setRoleStructurePreference] = useState('');
  const [startupInterests, setStartupInterests] = useState('');
  const [skillsAndExperience, setSkillsAndExperience] = useState('');
  const [ambiguityExample, setAmbiguityExample] = useState('');
  const [criticalFeedbackExample, setCriticalFeedbackExample] = useState('');
  const [workPreference, setWorkPreference] = useState('');
  const [commitmentsAndConflicts, setCommitmentsAndConflicts] = useState('');
  const [clarifyingQuestions, setClarifyingQuestions] = useState('');
  const [technicalProjectOverview, setTechnicalProjectOverview] = useState('');
  const [technicalRebuildChanges, setTechnicalRebuildChanges] = useState('');
  const [technicalDebuggingExample, setTechnicalDebuggingExample] = useState('');
  const [technicalTestingApproach, setTechnicalTestingApproach] = useState('');
  const [technicalOnboardingApproach, setTechnicalOnboardingApproach] = useState('');
  const [nonTechnicalOrganization, setNonTechnicalOrganization] = useState('');
  const [nonTechnicalFirstTwoWeeks, setNonTechnicalFirstTwoWeeks] = useState('');
  const [nonTechnicalCommunication, setNonTechnicalCommunication] = useState('');
  const [nonTechnicalProudProject, setNonTechnicalProudProject] = useState('');
  const [bestFitRoleOrStartup, setBestFitRoleOrStartup] = useState('');
  const [likelihoodToAccept, setLikelihoodToAccept] = useState('');
  const [commitmentConcerns, setCommitmentConcerns] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation>('YES');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingInterviewers, setBookingInterviewers] = useState<{ name: string; email: string }[]>([]);
  const [bookingStartTime, setBookingStartTime] = useState<string | null>(null);
  const [bookingInterviewType, setBookingInterviewType] = useState<'technical' | 'non-technical' | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);
  const [candidateError, setCandidateError] = useState('');
  const [existingInterview, setExistingInterview] = useState<Interview | null>(null);
  const [interviewLoadError, setInterviewLoadError] = useState('');

  useEffect(() => {
    async function loadInterviewers() {
      try {
        setBookingError('');
        const bookings = await getInterviewBookings();
        const matches = bookings
          .filter((booking) => booking.applicationId === applicationId && booking.status !== 'cancelled')
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        const matched = matches[0];
        if (matched) {
          setBookingInterviewers(matched.interviewers || []);
          setBookingStartTime(matched.startTime || null);
          setBookingInterviewType(matched.interviewType || null);
        } else {
          setBookingInterviewers([]);
          setBookingStartTime(null);
          setBookingInterviewType(null);
        }
      } catch (err: any) {
        setBookingError(err.message || 'Failed to load interviewers from sign-up.');
      }
    }

    if (applicationId) {
      loadInterviewers();
    }
  }, [applicationId]);

  useEffect(() => {
    async function loadInterview() {
      try {
        setInterviewLoadError('');
        const interview = await getInterview(applicationId!);
        setExistingInterview(interview);
        setPrimaryRoleInterest(interview.primaryRoleInterest || '');
        setSecondaryRoleInterest(interview.secondaryRoleInterest || '');
        setRoleStructurePreference(interview.roleStructurePreference || '');
        setStartupInterests(interview.startupInterests || '');
        setSkillsAndExperience(interview.skillsAndExperience || '');
        setAmbiguityExample(interview.ambiguityExample || '');
        setCriticalFeedbackExample(interview.criticalFeedbackExample || '');
        setWorkPreference(interview.workPreference || '');
        setCommitmentsAndConflicts(interview.commitmentsAndConflicts || '');
        setClarifyingQuestions(interview.clarifyingQuestions || '');
        setTechnicalProjectOverview(interview.technicalProjectOverview || '');
        setTechnicalRebuildChanges(interview.technicalRebuildChanges || '');
        setTechnicalDebuggingExample(interview.technicalDebuggingExample || '');
        setTechnicalTestingApproach(interview.technicalTestingApproach || '');
        setTechnicalOnboardingApproach(interview.technicalOnboardingApproach || '');
        setNonTechnicalOrganization(interview.nonTechnicalOrganization || '');
        setNonTechnicalFirstTwoWeeks(interview.nonTechnicalFirstTwoWeeks || '');
        setNonTechnicalCommunication(interview.nonTechnicalCommunication || '');
        setNonTechnicalProudProject(interview.nonTechnicalProudProject || '');
        setBestFitRoleOrStartup(interview.bestFitRoleOrStartup || '');
        setLikelihoodToAccept(interview.likelihoodToAccept || '');
        setCommitmentConcerns(interview.commitmentConcerns || '');
        setRecommendation(interview.recommendation || 'YES');
      } catch (err: any) {
        if (!String(err.message || '').includes('HTTP 404')) {
          setInterviewLoadError(err.message || 'Failed to load interview.');
        }
      }
    }

    if (applicationId) {
      loadInterview();
    }
  }, [applicationId]);

  useEffect(() => {
    async function loadCandidate() {
      try {
        setCandidateError('');
        const applications = await getApplications();
        const match = applications.find((app) => app.id === applicationId);
        if (match) {
          setCandidateName(match.fullName || null);
          setCandidateEmail(match.email || null);
        } else {
          setCandidateName(null);
          setCandidateEmail(null);
        }
      } catch (err: any) {
        setCandidateError(err.message || 'Failed to load candidate details.');
      }
    }

    if (applicationId) {
      loadCandidate();
    }
  }, [applicationId]);

  const interviewerLabel = useMemo(() => {
    if (bookingInterviewers.length > 0) {
      return bookingInterviewers
        .map((interviewer) => {
          if (interviewer.email) {
            return `${interviewer.name} (${interviewer.email})`;
          }
          return interviewer.name;
        })
        .join(', ');
    }
    if (user?.fullName || user?.email) {
      return `${user?.fullName || user?.email}${user?.email && user?.fullName ? ` (${user.email})` : ''}`;
    }
    return 'Unknown';
  }, [bookingInterviewers, user]);

  const interviewTypeLabel = useMemo(() => {
    if (bookingInterviewType === 'technical') return 'Technical';
    if (bookingInterviewType === 'non-technical') return 'Non-technical';
    return '—';
  }, [bookingInterviewType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (existingInterview) {
        const normalized = (value: string | undefined | null) => value ?? '';
        const patch: UpdateInterviewRequest = {};
        if (normalized(primaryRoleInterest) !== normalized(existingInterview.primaryRoleInterest)) patch.primaryRoleInterest = primaryRoleInterest;
        if (normalized(secondaryRoleInterest) !== normalized(existingInterview.secondaryRoleInterest)) patch.secondaryRoleInterest = secondaryRoleInterest;
        if (normalized(roleStructurePreference) !== normalized(existingInterview.roleStructurePreference)) patch.roleStructurePreference = roleStructurePreference;
        if (normalized(startupInterests) !== normalized(existingInterview.startupInterests)) patch.startupInterests = startupInterests;
        if (normalized(skillsAndExperience) !== normalized(existingInterview.skillsAndExperience)) patch.skillsAndExperience = skillsAndExperience;
        if (normalized(ambiguityExample) !== normalized(existingInterview.ambiguityExample)) patch.ambiguityExample = ambiguityExample;
        if (normalized(criticalFeedbackExample) !== normalized(existingInterview.criticalFeedbackExample)) patch.criticalFeedbackExample = criticalFeedbackExample;
        if (normalized(workPreference) !== normalized(existingInterview.workPreference)) patch.workPreference = workPreference;
        if (normalized(commitmentsAndConflicts) !== normalized(existingInterview.commitmentsAndConflicts)) patch.commitmentsAndConflicts = commitmentsAndConflicts;
        if (normalized(clarifyingQuestions) !== normalized(existingInterview.clarifyingQuestions)) patch.clarifyingQuestions = clarifyingQuestions;
        if (normalized(technicalProjectOverview) !== normalized(existingInterview.technicalProjectOverview)) patch.technicalProjectOverview = technicalProjectOverview;
        if (normalized(technicalRebuildChanges) !== normalized(existingInterview.technicalRebuildChanges)) patch.technicalRebuildChanges = technicalRebuildChanges;
        if (normalized(technicalDebuggingExample) !== normalized(existingInterview.technicalDebuggingExample)) patch.technicalDebuggingExample = technicalDebuggingExample;
        if (normalized(technicalTestingApproach) !== normalized(existingInterview.technicalTestingApproach)) patch.technicalTestingApproach = technicalTestingApproach;
        if (normalized(technicalOnboardingApproach) !== normalized(existingInterview.technicalOnboardingApproach)) patch.technicalOnboardingApproach = technicalOnboardingApproach;
        if (normalized(nonTechnicalOrganization) !== normalized(existingInterview.nonTechnicalOrganization)) patch.nonTechnicalOrganization = nonTechnicalOrganization;
        if (normalized(nonTechnicalFirstTwoWeeks) !== normalized(existingInterview.nonTechnicalFirstTwoWeeks)) patch.nonTechnicalFirstTwoWeeks = nonTechnicalFirstTwoWeeks;
        if (normalized(nonTechnicalCommunication) !== normalized(existingInterview.nonTechnicalCommunication)) patch.nonTechnicalCommunication = nonTechnicalCommunication;
        if (normalized(nonTechnicalProudProject) !== normalized(existingInterview.nonTechnicalProudProject)) patch.nonTechnicalProudProject = nonTechnicalProudProject;
        if (normalized(bestFitRoleOrStartup) !== normalized(existingInterview.bestFitRoleOrStartup)) patch.bestFitRoleOrStartup = bestFitRoleOrStartup;
        if (normalized(likelihoodToAccept) !== normalized(existingInterview.likelihoodToAccept)) patch.likelihoodToAccept = likelihoodToAccept;
        if (normalized(commitmentConcerns) !== normalized(existingInterview.commitmentConcerns)) patch.commitmentConcerns = commitmentConcerns;
        if (recommendation !== existingInterview.recommendation) patch.recommendation = recommendation;

        if (Object.keys(patch).length === 0) {
          alert('No changes to save.');
          setLoading(false);
          return;
        }

        await updateInterview(applicationId!, patch);
      } else {
        await createInterview(applicationId!, {
          primaryRoleInterest,
          secondaryRoleInterest,
          roleStructurePreference,
          startupInterests,
          skillsAndExperience,
          ambiguityExample,
          criticalFeedbackExample,
          workPreference,
          commitmentsAndConflicts,
          clarifyingQuestions,
          technicalProjectOverview,
          technicalRebuildChanges,
          technicalDebuggingExample,
          technicalTestingApproach,
          technicalOnboardingApproach,
          nonTechnicalOrganization,
          nonTechnicalFirstTwoWeeks,
          nonTechnicalCommunication,
          nonTechnicalProudProject,
          bestFitRoleOrStartup,
          likelihoodToAccept,
          commitmentConcerns,
          recommendation,
        });
      }

      alert('Interview recorded successfully!');
      navigate('/admin/applications');
    } catch (err: any) {
      setError(err.message || 'Failed to record interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>{existingInterview ? 'Edit Interview' : 'Record Interview'}</h1>
      <p>Application ID: {applicationId}</p>
      <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
        Candidate: {candidateName || '—'}{candidateEmail ? ` (${candidateEmail})` : ''}
      </div>
      <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
        Interviewer(s): {interviewerLabel}
        {bookingStartTime ? ` (Scheduled: ${new Date(bookingStartTime).toLocaleString('en-US', { timeZone: 'America/New_York' })})` : ''}
      </div>
      <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
        Interview Type: {interviewTypeLabel}
      </div>
      {interviewLoadError && (
        <div style={{ marginBottom: '10px', color: '#c33', fontSize: '13px' }}>
          {interviewLoadError}
        </div>
      )}
      {candidateError && (
        <div style={{ marginBottom: '10px', color: '#c33', fontSize: '13px' }}>
          {candidateError}
        </div>
      )}
      {bookingError && (
        <div style={{ marginBottom: '10px', color: '#c33', fontSize: '13px' }}>
          {bookingError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ marginTop: '20px' }}>Role Preferences *</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            What type of role are you most interested in?
          </label>
          <input
            type="text"
            value={primaryRoleInterest}
            onChange={(e) => setPrimaryRoleInterest(e.target.value)}
            placeholder="e.g., product, engineering, growth, design"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Are there other roles you would be open to if needed?
          </label>
          <input
            type="text"
            value={secondaryRoleInterest}
            onChange={(e) => setSecondaryRoleInterest(e.target.value)}
            placeholder="List any other roles they would consider"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Would you prefer a structured role with mentorship or an open-ended role with high autonomy? *
          </label>
          <select
            value={roleStructurePreference}
            onChange={(e) => setRoleStructurePreference(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value="">Select a preference</option>
            <option value="Structured role with mentorship">Structured role with mentorship</option>
            <option value="Open-ended role with high autonomy">Open-ended role with high autonomy</option>
          </select>
        </div>

        <h3 style={{ marginTop: '20px' }}>Startups & Industries of Interest</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            What industries and startup types (stage, size, mission) interest you, and what prior exposure do you have?
          </label>
          <textarea
            value={startupInterests}
            onChange={(e) => setStartupInterests(e.target.value)}
            rows={3}
            placeholder="Industries, startup stage/size/mission, and prior exposure"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3 style={{ marginTop: '20px' }}>Contribution & Experience</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            What experience or skills can you contribute immediately (projects, coursework, or work)?
          </label>
          <textarea
            value={skillsAndExperience}
            onChange={(e) => setSkillsAndExperience(e.target.value)}
            rows={3}
            placeholder="Key skills, experience, and examples"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Example of working with ambiguity or limited guidance
          </label>
          <textarea
            value={ambiguityExample}
            onChange={(e) => setAmbiguityExample(e.target.value)}
            rows={2}
            placeholder="Story or example"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Describe a time you gave or received critical feedback
          </label>
          <textarea
            value={criticalFeedbackExample}
            onChange={(e) => setCriticalFeedbackExample(e.target.value)}
            rows={2}
            placeholder="Situation, feedback, and outcome"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3 style={{ marginTop: '20px' }}>Work Details</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Remote vs. in-person preference and constraints
          </label>
          <textarea
            value={workPreference}
            onChange={(e) => setWorkPreference(e.target.value)}
            rows={2}
            placeholder="Preference and any constraints"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Any commitments, travel, or competing internships/programs during spring/summer?
          </label>
          <textarea
            value={commitmentsAndConflicts}
            onChange={(e) => setCommitmentsAndConflicts(e.target.value)}
            rows={3}
            placeholder="Classes, jobs, travel, or competing offers"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3 style={{ marginTop: '20px' }}>Questions</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Clarifying questions based on application or resume
          </label>
          <textarea
            value={clarifyingQuestions}
            onChange={(e) => setClarifyingQuestions(e.target.value)}
            rows={2}
            placeholder="Questions the interviewer asked"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div style={{ color: '#666', fontSize: '13px', marginTop: '-5px' }}>
          Reminder: Ask the candidate if they have any questions for us.
        </div>

        <h3 style={{ marginTop: '20px' }}>Technical Section</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Walk me through a project you built end to end. What was the hardest technical decision?
          </label>
          <textarea
            value={technicalProjectOverview}
            onChange={(e) => setTechnicalProjectOverview(e.target.value)}
            rows={2}
            placeholder="Project overview and hardest decision"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            If you had to rebuild that project today, what would you change and why?
          </label>
          <textarea
            value={technicalRebuildChanges}
            onChange={(e) => setTechnicalRebuildChanges(e.target.value)}
            rows={2}
            placeholder="Improvements and rationale"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tell me about a bug you struggled with. How did you debug it? What’s your debugging checklist?
          </label>
          <textarea
            value={technicalDebuggingExample}
            onChange={(e) => setTechnicalDebuggingExample(e.target.value)}
            rows={2}
            placeholder="Bug, approach, and checklist"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            How do you test your work? Give a concrete example.
          </label>
          <textarea
            value={technicalTestingApproach}
            onChange={(e) => setTechnicalTestingApproach(e.target.value)}
            rows={2}
            placeholder="Testing strategy and example"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            If you were joining a new codebase tomorrow, how would you onboard yourself?
          </label>
          <textarea
            value={technicalOnboardingApproach}
            onChange={(e) => setTechnicalOnboardingApproach(e.target.value)}
            rows={2}
            placeholder="Onboarding approach"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3 style={{ marginTop: '20px' }}>Non-Technical Section</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            How do you stay organized when managing multiple priorities?
          </label>
          <textarea
            value={nonTechnicalOrganization}
            onChange={(e) => setNonTechnicalOrganization(e.target.value)}
            rows={2}
            placeholder="Organization methods or tools"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            What would you want your first 2 weeks at a startup to look like?
          </label>
          <textarea
            value={nonTechnicalFirstTwoWeeks}
            onChange={(e) => setNonTechnicalFirstTwoWeeks(e.target.value)}
            rows={2}
            placeholder="Onboarding expectations"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            How do you communicate progress or roadblocks to a fast-moving team?
          </label>
          <textarea
            value={nonTechnicalCommunication}
            onChange={(e) => setNonTechnicalCommunication(e.target.value)}
            rows={2}
            placeholder="Communication style and cadence"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            What is a project you’re proud of and why?
          </label>
          <textarea
            value={nonTechnicalProudProject}
            onChange={(e) => setNonTechnicalProudProject(e.target.value)}
            rows={2}
            placeholder="Project and rationale"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3 style={{ marginTop: '20px' }}>Interviewer Notes</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            If not their stated preference, what role or type of startup would they be best suited for?
          </label>
          <textarea
            value={bestFitRoleOrStartup}
            onChange={(e) => setBestFitRoleOrStartup(e.target.value)}
            rows={2}
            placeholder="Role or startup fit notes"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Likelihood of accepting an offer if matched
          </label>
          <select
            value={likelihoodToAccept}
            onChange={(e) => setLikelihoodToAccept(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          >
            <option value="">Select likelihood</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Any concerns around commitment or follow-through?
          </label>
          <textarea
            value={commitmentConcerns}
            onChange={(e) => setCommitmentConcerns(e.target.value)}
            rows={2}
            placeholder="Concerns or risks"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Recommendation *
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
