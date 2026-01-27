import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudentApplication, uploadResume } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const DRAFT_KEY = 'student-application-draft';

export default function ApplicationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [portfolioWebsite, setPortfolioWebsite] = useState('');
  const [howDidYouHear, setHowDidYouHear] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [rolePreferences, setRolePreferences] = useState<string[]>([]);
  const [startupsAndIndustries, setStartupsAndIndustries] = useState('');
  const [contributionAndExperience, setContributionAndExperience] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');
  const [isUSCitizen, setIsUSCitizen] = useState('');
  const [workAuthorization, setWorkAuthorization] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [previouslyApplied, setPreviouslyApplied] = useState(false);
  const [previouslyParticipated, setPreviouslyParticipated] = useState(false);
  const [hasUpcomingInternshipOffers, setHasUpcomingInternshipOffers] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const hasPromptedForDraft = useRef(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft && !hasPromptedForDraft.current) {
      hasPromptedForDraft.current = true;
      try {
        const parsed = JSON.parse(draft);
        const savedDate = new Date(parsed.savedAt);
        const shouldRestore = window.confirm(
          `We found a saved draft from ${savedDate.toLocaleString()}. Would you like to continue where you left off?`
        );

        if (shouldRestore) {
          setFullName(parsed.fullName || '');
          setPronouns(parsed.pronouns || '');
          setGradYear(parsed.gradYear || '');
          setSchool(parsed.school || '');
          setMajor(parsed.major || '');
          setEmail(parsed.email || user?.email || '');
          setLinkedinProfile(parsed.linkedinProfile || '');
          setPortfolioWebsite(parsed.portfolioWebsite || '');
          setHowDidYouHear(parsed.howDidYouHear || '');
          setReferralSource(parsed.referralSource || '');
          setRolePreferences(parsed.rolePreferences || []);
          setStartupsAndIndustries(parsed.startupsAndIndustries || '');
          setContributionAndExperience(parsed.contributionAndExperience || '');
          setWorkMode(parsed.workMode || '');
          setTimeCommitment(parsed.timeCommitment || '');
          setIsUSCitizen(parsed.isUSCitizen || '');
          setWorkAuthorization(parsed.workAuthorization || '');
          setAdditionalComments(parsed.additionalComments || '');
          setPreviouslyApplied(parsed.previouslyApplied || false);
          setPreviouslyParticipated(parsed.previouslyParticipated || false);
          setHasUpcomingInternshipOffers(parsed.hasUpcomingInternshipOffers || false);
          setLastSaved(savedDate);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [user?.email]);

  // Auto-save to localStorage whenever form fields change
  useEffect(() => {
    // Only save if user has started filling the form
    if (fullName || email || major || startupsAndIndustries || contributionAndExperience) {
      const draft = {
        fullName,
        pronouns,
        gradYear,
        school,
        major,
        email,
        linkedinProfile,
        portfolioWebsite,
        howDidYouHear,
        referralSource,
        rolePreferences,
        startupsAndIndustries,
        contributionAndExperience,
        workMode,
        timeCommitment,
        isUSCitizen,
        workAuthorization,
        additionalComments,
        previouslyApplied,
        previouslyParticipated,
        hasUpcomingInternshipOffers,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(new Date());
    }
  }, [
    fullName, pronouns, gradYear, school, major, email,
    linkedinProfile, portfolioWebsite, howDidYouHear, referralSource,
    rolePreferences, startupsAndIndustries,
    contributionAndExperience, workMode, timeCommitment, isUSCitizen,
    workAuthorization, additionalComments, previouslyApplied,
    previouslyParticipated, hasUpcomingInternshipOffers
  ]);

  const handleRoleChange = (role: string) => {
    if (rolePreferences.includes(role)) {
      setRolePreferences(rolePreferences.filter(r => r !== role));
    } else {
      setRolePreferences([...rolePreferences, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create the application first
      const application = await createStudentApplication({
        fullName,
        pronouns: pronouns || undefined,
        gradYear,
        school: school || undefined,
        major,
        email,
        linkedinProfile: linkedinProfile || undefined,
        portfolioWebsite: portfolioWebsite || undefined,
        howDidYouHear: howDidYouHear || undefined,
        referralSource: referralSource || undefined,
        rolePreferences: rolePreferences.length > 0 ? rolePreferences : undefined,
        startupsAndIndustries,
        contributionAndExperience,
        workMode,
        timeCommitment,
        isUSCitizen,
        workAuthorization: workAuthorization || undefined,
        additionalComments: additionalComments || undefined,
        previouslyApplied,
        previouslyParticipated: previouslyParticipated || undefined,
        hasUpcomingInternshipOffers,
      });

      // Upload resume if provided
      if (resumeFile) {
        await uploadResume(application.id, resumeFile);
      }

      // Clear the draft after successful submission
      localStorage.removeItem(DRAFT_KEY);

      alert('Application submitted successfully!');
      navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-blue)', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ marginTop: 0, marginBottom: '10px', color: '#0a468f' }}>CORE Fellowship Application</h1>

          {lastSaved && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #c3e6cb'
            }}>
              ✓ Draft auto-saved at {lastSaved.toLocaleTimeString()}
            </div>
          )}

          <div style={{
            background: '#f8fbff',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '30px',
            lineHeight: '1.6',
            border: '2px solid #93c5fd'
          }}>
        <p style={{ marginTop: 0 }}>
          <strong>CORE Fellows</strong> (previously Almaworks Fellows) are matched with startups founded by Columbia alumni and around NYC for an ~8 week internship. We will be considering applications for the <strong>Spring 2026 CORE Fellowship</strong>, with a deadline of <strong>Friday, February 1st, 2026 at 11:59pm EST</strong>. We encourage you to sign up as soon as possible. No prior startup experience is required to participate.
        </p>

        <p>
          Fellows take on substantive projects that have a direct impact on the startup. Fellows work closely with the company's founding team to impact organizational strategy, product development, or go-to-market strategy.
        </p>

        <p>
          Though the specifics of a fellow-company partnership will vary, responsibilities of the CORE Fellow position include:
        </p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Meeting with founders to gain a deep understanding of their businesses' strengths, potential areas of growth, and barriers to success.</li>
          <li>Collaborating with a team to address the company needs. Specific tasks depend on your expertise, but may include:
            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
              <li>Conducting customer discovery and competitor analysis</li>
              <li>Spearheading market research</li>
              <li>Developing VC fundraising strategies</li>
              <li>Reporting on novel business development or marketing verticals and go-to-market strategies</li>
            </ul>
          </li>
          <li>Working alongside the company's founders to test, refine and implement the solutions of your team</li>
        </ul>

        <p>
          <strong>Perks of the program include:</strong>
        </p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Valuable and marketable experience in the startup sector</li>
          <li>Exposure to Columbia's and NYC's most promising founders and startups</li>
          <li>A strong network of driven and bright Columbia University founders and undergraduates interested in entrepreneurship, startups, software engineering, consulting, investment banking, and more</li>
        </ul>

        <p>
          <strong>Note:</strong> Companies will be looking for part-time positions. Fellows' personal and professional interests are taken into account before they are matched with a given company. Once matched with a company, fellows will have an internal interview with that company to secure the position they were matched with. Interviews will be conducted 2/17 - 2/20.
        </p>

        <p style={{ marginBottom: 0 }}>
          Please direct any questions to Kavya at ka3041@columbia.edu or Ashley at ag4647@columbia.edu.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <h3>Personal Information</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Pronouns
          </label>
          <input
            type="text"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="e.g., she/her, he/him, they/them"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Graduation Year *
          </label>
          {['2026', '2027', '2028', '2029'].map(year => (
            <div key={year} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="gradYear"
                  value={year}
                  checked={gradYear === year}
                  onChange={(e) => setGradYear(e.target.value)}
                  required
                  style={{ marginRight: '8px' }}
                />
                {year}
              </label>
            </div>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            School
          </label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="CC, SEAS, Barnard, GS, etc."
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Major *
          </label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            LinkedIn Profile
          </label>
          <input
            type="url"
            value={linkedinProfile}
            onChange={(e) => setLinkedinProfile(e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Portfolio/Personal Website/GitHub
          </label>
          <input
            type="url"
            value={portfolioWebsite}
            onChange={(e) => setPortfolioWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Resume (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
          <small style={{ color: '#666' }}>
            {resumeFile ? `Selected: ${resumeFile.name}` : 'Upload your resume as a PDF (max 5MB)'}
          </small>
        </div>

        <h3>Discovery</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            How did you hear about CORE Fellowship?
          </label>
          {['Website', 'Word-of-mouth', 'Previous Fellow', 'Social Media', 'Other'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="howDidYouHear"
                  value={option}
                  checked={howDidYouHear === option}
                  onChange={(e) => setHowDidYouHear(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>

        {(howDidYouHear === 'Word-of-mouth' || howDidYouHear === 'Previous Fellow') && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Who referred you?
            </label>
            <input
              type="text"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>
        )}

        <h3>Role Preferences</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            What roles are you interested in? (Select all that apply)
          </label>
          {['Creative', 'Business', 'Tech'].map(role => (
            <div key={role} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={rolePreferences.includes(role)}
                  onChange={() => handleRoleChange(role)}
                  style={{ marginRight: '8px' }}
                />
                {role}
              </label>
            </div>
          ))}
        </div>

        <h3>Short Answer Questions</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Startups and Industries of Interest *
          </label>
          <p style={{ margin: '5px 0 10px 0', color: '#555', fontSize: '14px' }}>
            List startups you would love to work at and what you would do. Talk about startups you love, upcoming ones you are excited for, your dream role and if your ideas for them. Are there any industries or companies that you are particularly knowledgeable or curious about? Tell us why you are interested in that industry/company in particular, and how you've acted on that interest so far.
          </p>
          <p style={{ margin: '5px 0 10px 0', color: '#999', fontSize: '13px', fontStyle: 'italic' }}>
            100-250 words
          </p>
          <textarea
            value={startupsAndIndustries}
            onChange={(e) => setStartupsAndIndustries(e.target.value)}
            required
            rows={6}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            What Can You Contribute? *
          </label>
          <p style={{ margin: '5px 0 10px 0', color: '#555', fontSize: '14px' }}>
            Sell yourself to us. What can you contribute? Additionally, tell us about a current or past project you work/worked on and highlight any tangible skills you used in this project that would help you succeed in this role.
          </p>
          <p style={{ margin: '5px 0 10px 0', color: '#999', fontSize: '13px', fontStyle: 'italic' }}>
            100-250 words
          </p>
          <textarea
            value={contributionAndExperience}
            onChange={(e) => setContributionAndExperience(e.target.value)}
            required
            rows={6}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            What is your preferred mode of work? *
          </label>
          {['Hybrid', 'Remote', 'In person (NYC)', 'Anything'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="workMode"
                  value={option}
                  checked={workMode === option}
                  onChange={(e) => setWorkMode(e.target.value)}
                  required
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            How much time could you commit to your internship this spring? *
          </label>
          <p style={{ margin: '5px 0 10px 0', color: '#555', fontSize: '14px' }}>
            Be sure to include what days of the week, time periods, etc. work for you. This is just preliminary, you can let us know if anything changes during your interview.
          </p>
          <textarea
            value={timeCommitment}
            onChange={(e) => setTimeCommitment(e.target.value)}
            required
            rows={3}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Are you a US Citizen? *
          </label>
          {['Yes', 'No'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="isUSCitizen"
                  value={option}
                  checked={isUSCitizen === option}
                  onChange={(e) => setIsUSCitizen(e.target.value)}
                  required
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>

        {isUSCitizen === 'No' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              If not, please elaborate on your status and work authorization.
            </label>
            <textarea
              value={workAuthorization}
              onChange={(e) => setWorkAuthorization(e.target.value)}
              rows={3}
              placeholder="Please describe your current visa status and work authorization..."
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>
        )}

        <h3>Miscellaneous</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Additional Comments
          </label>
          <textarea
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            rows={3}
            placeholder="Anything else you'd like us to know?"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={previouslyApplied}
              onChange={(e) => setPreviouslyApplied(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            I have previously applied to CORE Fellowship
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={previouslyParticipated}
              onChange={(e) => setPreviouslyParticipated(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            I have previously participated in CORE Fellowship
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={hasUpcomingInternshipOffers}
              onChange={(e) => setHasUpcomingInternshipOffers(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            I have upcoming internship offers
          </label>
        </div>

        {error && <div style={{ color: 'red', fontSize: '14px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#ccc' : '#93c5fd',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/student')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}