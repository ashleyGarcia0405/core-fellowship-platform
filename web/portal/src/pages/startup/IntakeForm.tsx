import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStartup } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const DRAFT_KEY = 'startup-intake-draft';

export default function IntakeForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [operatingMode, setOperatingMode] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [internsSupervisor, setInternsSupervisor] = useState('');
  const [hasHiredInternsPreviously, setHasHiredInternsPreviously] = useState('');
  const [numberOfInternsNeeded, setNumberOfInternsNeeded] = useState('');
  const [positions, setPositions] = useState<Array<{ roleType: string; description: string; requiredSkills: string; timeCommitment: string }>>([]);
  const [willPayInterns, setWillPayInterns] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payAmountOther, setPayAmountOther] = useState('');
  const [lookingForPermanentIntern, setLookingForPermanentIntern] = useState('');
  const [permanentInternOther, setPermanentInternOther] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [commitmentAcknowledged, setCommitmentAcknowledged] = useState(false);

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
          setCompanyName(parsed.companyName || '');
          setWebsite(parsed.website || '');
          setIndustry(parsed.industry || '');
          setDescription(parsed.description || '');
          setStage(parsed.stage || '');
          setTeamSize(parsed.teamSize || '');
          setFoundedYear(parsed.foundedYear || '');
          setContactName(parsed.contactName || '');
          setContactTitle(parsed.contactTitle || '');
          setContactEmail(parsed.contactEmail || user?.email || '');
          setContactPhone(parsed.contactPhone || '');
          setOperatingMode(parsed.operatingMode || '');
          setTimeZone(parsed.timeZone || '');
          setInternsSupervisor(parsed.internsSupervisor || '');
          setHasHiredInternsPreviously(parsed.hasHiredInternsPreviously || '');
          setNumberOfInternsNeeded(parsed.numberOfInternsNeeded || '');
          setPositions(parsed.positions || []);
          setWillPayInterns(parsed.willPayInterns || '');
          setPayAmount(parsed.payAmount || '');
          setPayAmountOther(parsed.payAmountOther || '');
          setLookingForPermanentIntern(parsed.lookingForPermanentIntern || '');
          setPermanentInternOther(parsed.permanentInternOther || '');
          setReferralSource(parsed.referralSource || '');
          setCommitmentAcknowledged(parsed.commitmentAcknowledged || false);
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
    if (companyName || contactName || contactEmail) {
      const draft = {
        companyName,
        website,
        industry,
        description,
        stage,
        teamSize,
        foundedYear,
        contactName,
        contactTitle,
        contactEmail,
        contactPhone,
        operatingMode,
        timeZone,
        internsSupervisor,
        hasHiredInternsPreviously,
        numberOfInternsNeeded,
        positions,
        willPayInterns,
        payAmount,
        payAmountOther,
        lookingForPermanentIntern,
        permanentInternOther,
        referralSource,
        commitmentAcknowledged,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(new Date());
    }
  }, [
    companyName, website, industry, description, stage, teamSize, foundedYear,
    contactName, contactTitle, contactEmail, contactPhone, operatingMode, timeZone,
    internsSupervisor, hasHiredInternsPreviously, numberOfInternsNeeded, positions,
    willPayInterns, payAmount, payAmountOther, lookingForPermanentIntern,
    permanentInternOther, referralSource, commitmentAcknowledged
  ]);

  // Initialize positions array when numberOfInternsNeeded changes
  useEffect(() => {
    const count = parseInt(numberOfInternsNeeded) || 0;
    if (count > 0 && count !== positions.length) {
      const newPositions = Array.from({ length: count }, (_, i) =>
        positions[i] || { roleType: '', description: '', requiredSkills: '', timeCommitment: '' }
      );
      setPositions(newPositions);
    } else if (count === 0) {
      setPositions([]);
    }
  }, [numberOfInternsNeeded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert positions to API format
      const formattedPositions = positions
        .filter(p => p.roleType || p.description || p.requiredSkills)
        .map(p => ({
          roleType: p.roleType,
          description: p.description,
          requiredSkills: p.requiredSkills ? p.requiredSkills.split(',').map(s => s.trim()).filter(s => s) : undefined,
          timeCommitment: p.timeCommitment || undefined
        }));

      await createStartup({
        companyName,
        website: website || undefined,
        industry: industry || undefined,
        description: description || undefined,
        stage: stage || undefined,
        teamSize: teamSize || undefined,
        foundedYear: foundedYear || undefined,
        contactName,
        contactTitle,
        contactEmail,
        contactPhone: contactPhone || undefined,
        operatingMode,
        timeZone: timeZone || undefined,
        internsSupervisor,
        hasHiredInternsPreviously: hasHiredInternsPreviously === 'Yes',
        numberOfInternsNeeded: numberOfInternsNeeded ? parseInt(numberOfInternsNeeded) : undefined,
        positions: formattedPositions.length > 0 ? formattedPositions : undefined,
        willPayInterns,
        payAmount: willPayInterns === 'Other' ? payAmountOther : (payAmount || undefined),
        lookingForPermanentIntern: lookingForPermanentIntern === 'Other' ? permanentInternOther : lookingForPermanentIntern,
        referralSource: referralSource || undefined,
        commitmentAcknowledged: commitmentAcknowledged || undefined,
      });

      // Clear the draft after successful submission
      localStorage.removeItem(DRAFT_KEY);

      alert('Startup intake form submitted successfully!');
      navigate('/startup');
    } catch (err: any) {
      setError(err.message || 'Failed to submit intake form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-blue)', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ marginTop: 0, marginBottom: '10px', color: '#0a468f' }}>CORE Fellowship Startup Intake Form</h1>

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
            <p style={{ marginTop: 0, marginBottom: 0, color: '#333' }}>
              Please fill out this form to request a CORE Fellow for <strong>Summer 2025 (June 2nd - August 1st officially)</strong>, although internships may be extended based on discussions with fellow.
            </p>
          </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <h3>Company Information</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Company Name *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.com"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Industry
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., Fintech, Healthcare, SaaS"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Company Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe your company and product/service"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Funding Stage
          </label>
          {['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Bootstrapped'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="stage"
                  value={option}
                  checked={stage === option}
                  onChange={(e) => setStage(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Team Size
          </label>
          <input
            type="text"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            placeholder="e.g., 5-10 people"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Founded Year
          </label>
          <input
            type="text"
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
            placeholder="2023"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3>Contact Information</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Contact Name *
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Your Title/Role *
          </label>
          <input
            type="text"
            value={contactTitle}
            onChange={(e) => setContactTitle(e.target.value)}
            required
            placeholder="e.g., CEO, CTO, Founder"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <h3>Operating Details</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Operating Mode *
          </label>
          {['Hybrid', 'Fully Remote', 'Fully In Person'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="operatingMode"
                  value={option}
                  checked={operatingMode === option}
                  onChange={(e) => setOperatingMode(e.target.value)}
                  required
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>

        {(operatingMode === 'Fully Remote' || operatingMode === 'Hybrid') && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Time Zone
            </label>
            <input
              type="text"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              placeholder="e.g., EST, PST"
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>
        )}

        <h3>Internship Details</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Who will supervise the interns? *
          </label>
          <input
            type="text"
            value={internsSupervisor}
            onChange={(e) => setInternsSupervisor(e.target.value)}
            required
            placeholder="Name and title"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Have you hired student interns in the past? *
          </label>
          {['Yes', 'No'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="hasHiredInternsPreviously"
                  value={option}
                  checked={hasHiredInternsPreviously === option}
                  onChange={(e) => setHasHiredInternsPreviously(e.target.value)}
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
            How many interns are you looking for? *
          </label>
          <input
            type="number"
            list="intern-count-options"
            value={numberOfInternsNeeded}
            onChange={(e) => setNumberOfInternsNeeded(e.target.value)}
            min="0"
            placeholder="0"
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
          <datalist id="intern-count-options">
            <option value="0" />
            <option value="1" />
            <option value="2" />
            <option value="3" />
            <option value="4" />
            <option value="5" />
          </datalist>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
            Type any number or pick a suggestion.
          </div>
        </div>

        {positions.map((position, index) => (
          <div key={index} style={{
            background: '#f8fbff',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #93c5fd',
            marginBottom: '15px'
          }}>
            <h4 style={{ marginTop: 0, color: '#0a468f' }}>Intern Position {index + 1}</h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Role Type/Title *
              </label>
              <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 10px 0' }}>
                What is the role title for this intern position? Examples: "Software Engineering Intern", "Marketing Intern", "Business Development Intern", "Product Design Intern"
              </p>
              <input
                type="text"
                value={position.roleType}
                onChange={(e) => {
                  const newPositions = [...positions];
                  newPositions[index].roleType = e.target.value;
                  setPositions(newPositions);
                }}
                required
                placeholder="e.g., Software Engineering Intern"
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description of Role and Responsibilities *
              </label>
              <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 10px 0' }}>
                Describe in detail what this intern will be working on. Include specific projects, daily responsibilities, what they'll learn, and the type of impact they'll have on your company. Be specific so students can understand what they'll be doing.
              </p>
              <textarea
                value={position.description}
                onChange={(e) => {
                  const newPositions = [...positions];
                  newPositions[index].description = e.target.value;
                  setPositions(newPositions);
                }}
                required
                rows={5}
                placeholder="Example: You'll work on building our mobile app frontend using React Native, implement new features based on user feedback, write unit tests, participate in code reviews, and collaborate with our design team to create intuitive user interfaces."
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Required Skills *
              </label>
              <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 10px 0' }}>
                For <strong>technical roles</strong>: Specify programming languages (e.g., Python, JavaScript, React, SQL), tools, frameworks, and any specific technical experiences needed.<br/>
                For <strong>non-technical roles</strong>: List relevant skills, software proficiency, and experience (e.g., Market Research, Excel, Communication, Project Management).
              </p>
              <textarea
                value={position.requiredSkills}
                onChange={(e) => {
                  const newPositions = [...positions];
                  newPositions[index].requiredSkills = e.target.value;
                  setPositions(newPositions);
                }}
                required
                rows={3}
                placeholder="Separate multiple skills with commas. Example: Python, JavaScript, React, Git, APIs"
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Time Commitment
              </label>
              <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 10px 0' }}>
                How many hours per week do you expect the intern to work? (e.g., "10-15 hours/week", "20 hours/week", "Full-time (40 hours/week)")
              </p>
              <input
                type="text"
                value={position.timeCommitment}
                onChange={(e) => {
                  const newPositions = [...positions];
                  newPositions[index].timeCommitment = e.target.value;
                  setPositions(newPositions);
                }}
                placeholder="e.g., 15-20 hours/week"
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ))}

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Will you pay interns? *
          </label>
          {['Yes', 'No', 'Other'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="willPayInterns"
                  value={option}
                  checked={willPayInterns === option}
                  onChange={(e) => setWillPayInterns(e.target.value)}
                  required
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>

        {willPayInterns === 'Yes' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Pay Amount ($)
            </label>
            <input
              type="text"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="e.g., $20/hour or $5000 total"
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>
        )}

        {willPayInterns === 'Other' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Please specify pay arrangement *
            </label>
            <input
              type="text"
              value={payAmountOther}
              onChange={(e) => setPayAmountOther(e.target.value)}
              required
              placeholder="Describe your compensation arrangement"
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Are you looking for a permanent intern? *
          </label>
          {['Yes', 'No', 'Other'].map(option => (
            <div key={option} style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="radio"
                  name="lookingForPermanentIntern"
                  value={option}
                  checked={lookingForPermanentIntern === option}
                  onChange={(e) => setLookingForPermanentIntern(e.target.value)}
                  required
                  style={{ marginRight: '8px' }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>

        {lookingForPermanentIntern === 'Other' && (
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Please specify *
            </label>
            <input
              type="text"
              value={permanentInternOther}
              onChange={(e) => setPermanentInternOther(e.target.value)}
              required
              placeholder="Describe your preference"
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>
        )}

        <h3>Additional Information</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Who referred you to this program?
          </label>
          <input
            type="text"
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={commitmentAcknowledged}
              onChange={(e) => setCommitmentAcknowledged(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            I commit to accepting at least one CORE fellow if matched
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
            {loading ? 'Submitting...' : 'Submit Intake Form'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/startup')}
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
