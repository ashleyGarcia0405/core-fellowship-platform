import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getApplications,
  getAvailableStartups,
  getMatchPreferences,
  createMatchPreferences,
  updateMatchPreferences,
  type RoleReference,
  type AvailableStartup,
  type StudentApplication,
} from '../../lib/api';

const DRAFT_KEY = 'match-preference-draft';

export default function MatchPreferenceForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Application state
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [existingPreferenceId, setExistingPreferenceId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Available startups/roles
  const [startups, setStartups] = useState<AvailableStartup[]>([]);

  // Form state
  const [rankedRoles, setRankedRoles] = useState<RoleReference[]>([]);
  const [notes, setNotes] = useState('');
  const [expandedStartups, setExpandedStartups] = useState<Set<string>>(new Set());
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  const hasPromptedForDraft = useRef(false);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Get user's application, verify finalist
        const apps = await getApplications();
        const finalistApp = apps.find(a => a.status === 'finalist');
        if (!finalistApp) {
          setError('Only finalists can submit match preferences.');
          setLoading(false);
          return;
        }
        setApplication(finalistApp);

        // 2. Fetch available startups
        const availableStartups = await getAvailableStartups();
        setStartups(availableStartups);

        // 3. Check for existing preferences
        try {
          const existing = await getMatchPreferences(finalistApp.id);
          setExistingPreferenceId(existing.id);
          setRankedRoles(existing.rankedRoles || []);
          setNotes(existing.notes || '');
          setIsSubmitted(existing.submitted);
        } catch {
          // No existing preferences — check localStorage draft
          if (!hasPromptedForDraft.current) {
            hasPromptedForDraft.current = true;
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
              try {
                const parsed = JSON.parse(draft);
                const savedDate = new Date(parsed.savedAt);
                const shouldRestore = window.confirm(
                  `We found a saved draft from ${savedDate.toLocaleString()}. Would you like to continue where you left off?`
                );
                if (shouldRestore) {
                  setRankedRoles(parsed.rankedRoles || []);
                  setNotes(parsed.notes || '');
                }
              } catch {
                // ignore corrupt draft
              }
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!application) return;
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        rankedRoles,
        notes,
        savedAt: new Date().toISOString(),
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [rankedRoles, notes, isSubmitted, application]);

  const addRole = (startupId: string, positionIndex: number, startupName: string, roleType: string) => {
    // Don't add duplicates
    if (rankedRoles.some(r => r.startupId === startupId && r.positionIndex === positionIndex)) return;
    setRankedRoles([...rankedRoles, { startupId, positionIndex, startupName, roleType }]);
  };

  const removeRole = (index: number) => {
    setRankedRoles(rankedRoles.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...rankedRoles];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setRankedRoles(updated);
  };

  const moveDown = (index: number) => {
    if (index === rankedRoles.length - 1) return;
    const updated = [...rankedRoles];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setRankedRoles(updated);
  };

  const handleSaveDraft = async () => {
    if (!application) return;
    setSaving(true);
    setError('');
    try {
      if (existingPreferenceId) {
        await updateMatchPreferences(application.id, { rankedRoles, notes, submit: false });
      } else {
        const created = await createMatchPreferences(application.id, { rankedRoles, notes, submit: false });
        setExistingPreferenceId(created.id);
      }
      localStorage.removeItem(DRAFT_KEY);
    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!application) return;
    if (rankedRoles.length === 0) {
      setError('Please rank at least one role before submitting.');
      return;
    }
    if (!window.confirm(isSubmitted ? 'Are you sure you want to resubmit your preferences? This will overwrite your previous submission.' : 'Are you sure you want to submit your preferences?')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (existingPreferenceId) {
        await updateMatchPreferences(application.id, { rankedRoles, notes, submit: true });
      } else {
        await createMatchPreferences(application.id, { rankedRoles, notes, submit: true });
      }
      setIsSubmitted(true);
      localStorage.removeItem(DRAFT_KEY);
    } catch (err: any) {
      setError(err.message || 'Failed to submit preferences');
    } finally {
      setSaving(false);
    }
  };

  const isRoleAdded = (startupId: string, positionIndex: number) => {
    return rankedRoles.some(r => r.startupId === startupId && r.positionIndex === positionIndex);
  };

  const toggleStartup = useCallback((id: string) => {
    setExpandedStartups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleRole = useCallback((key: string) => {
    setExpandedRoles(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-blue)' }}>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-blue)', flexDirection: 'column', gap: '20px' }}>
        <p style={{ color: '#dc3545' }}>{error}</p>
        <button onClick={() => navigate('/student')} style={linkButtonStyle}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-blue)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/student')} style={{ ...linkButtonStyle, marginBottom: '20px' }}>
          &larr; Back to Dashboard
        </button>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '40px' }}>
          <h1 style={{ fontSize: '28px', color: '#0a468f', marginBottom: '8px' }}>Match Preference Form</h1>
          <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
            Rank the roles you're most interested in. Your #1 choice is your top preference.
            {!isSubmitted && ' You can save a draft and come back later.'}
          </p>

          {isSubmitted && (
            <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px', padding: '16px', marginBottom: '30px' }}>
              <strong style={{ color: '#155724' }}>Preferences Submitted</strong>
              <p style={{ color: '#155724', margin: '8px 0 0' }}>Your match preferences have been submitted. You can update and resubmit below.</p>
            </div>
          )}

          {error && (
            <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ color: '#721c24', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Your Rankings */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', color: '#0a468f', marginBottom: '16px' }}>Your Rankings</h2>
            {rankedRoles.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No roles ranked yet. Browse available roles below and add them to your rankings.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rankedRoles.map((role, index) => (
                  <div key={`${role.startupId}-${role.positionIndex}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 18px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#0a468f',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{role.roleType}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{role.startupName}</div>
                    </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => moveUp(index)} disabled={index === 0}
                          style={{ ...smallBtnStyle, opacity: index === 0 ? 0.3 : 1 }} title="Move up">&#9650;</button>
                        <button onClick={() => moveDown(index)} disabled={index === rankedRoles.length - 1}
                          style={{ ...smallBtnStyle, opacity: index === rankedRoles.length - 1 ? 0.3 : 1 }} title="Move down">&#9660;</button>
                        <button onClick={() => removeRole(index)}
                          style={{ ...smallBtnStyle, color: '#dc3545', borderColor: '#dc3545' }} title="Remove">&#10005;</button>
                      </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', color: '#0a468f', marginBottom: '8px' }}>Additional Notes (Optional)</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
              Anything you want us to know about your preferences — e.g., constraints, strong feelings about a particular role, etc.
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
            <button onClick={handleSaveDraft} disabled={saving} style={{
              padding: '12px 28px',
              border: '2px solid #0a468f',
              borderRadius: '8px',
              background: 'white',
              color: '#0a468f',
              fontWeight: '600',
              fontSize: '15px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={handleSubmit} disabled={saving || rankedRoles.length === 0} style={{
              padding: '12px 28px',
              border: 'none',
              borderRadius: '8px',
              background: rankedRoles.length === 0 ? '#ccc' : '#0a468f',
              color: 'white',
              fontWeight: '600',
              fontSize: '15px',
              cursor: saving || rankedRoles.length === 0 ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}>
              {saving ? 'Submitting...' : isSubmitted ? 'Resubmit Preferences' : 'Submit Preferences'}
            </button>
          </div>

          {/* Available Roles */}
          <div>
              <h2 style={{ fontSize: '20px', color: '#0a468f', marginBottom: '16px' }}>Available Roles</h2>
              {startups.length === 0 ? (
                <p style={{ color: '#999' }}>No startups available yet. Check back later.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {startups.map(startup => {
                    const startupExpanded = expandedStartups.has(startup.id);
                    const roleCount = startup.positions?.length || 0;

                    return (
                      <div key={startup.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        background: 'white',
                        overflow: 'hidden',
                      }}>
                        {/* Startup header */}
                        <div
                          onClick={() => toggleStartup(startup.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '18px 20px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            background: startupExpanded ? '#f8f9fa' : 'white',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '17px', color: '#333' }}>
                              {startup.companyName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#888', marginTop: '3px' }}>
                              {[startup.industry, startup.operatingMode, roleCount > 0 ? `${roleCount} role${roleCount > 1 ? 's' : ''}` : null].filter(Boolean).join(' \u00B7 ')}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '20px',
                            color: '#999',
                            transition: 'transform 0.2s',
                            transform: startupExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            lineHeight: 1,
                            flexShrink: 0,
                            marginLeft: '16px',
                          }}>
                            &#9662;
                          </span>
                        </div>

                        {/* Expanded startup content */}
                        {startupExpanded && (
                          <div style={{ borderTop: '1px solid #f0f0f0' }}>
                            {/* Company details */}
                            <div style={{ padding: '20px 20px 0' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                                {startup.stage && (
                                  <div><span style={{ color: '#999' }}>Stage:</span> {startup.stage}</div>
                                )}
                                {startup.teamSize && (
                                  <div><span style={{ color: '#999' }}>Team size:</span> {startup.teamSize}</div>
                                )}
                                {startup.willPayInterns && (
                                  <div><span style={{ color: '#999' }}>Paid:</span> {startup.willPayInterns}{startup.payAmount ? ` (${startup.payAmount})` : ''}</div>
                                )}
                                {startup.website && (
                                  <div>
                                    <a href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`}
                                      target="_blank" rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      style={{ color: '#0a468f', textDecoration: 'none' }}>
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>

                              {startup.description && (
                                <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 20px' }}>
                                  {startup.description}
                                </p>
                              )}
                            </div>

                            {/* Roles list */}
                            {startup.positions && startup.positions.length > 0 ? (
                              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {startup.positions.map((pos, posIdx) => {
                                  const roleKey = `${startup.id}-${posIdx}`;
                                  const added = isRoleAdded(startup.id, posIdx);
                                  const roleExpanded = expandedRoles.has(roleKey);

                                  return (
                                    <div key={posIdx} style={{
                                      border: added ? '2px solid #0a468f' : '1px solid #e0e0e0',
                                      borderRadius: '8px',
                                      background: '#fafafa',
                                      overflow: 'hidden',
                                    }}>
                                      {/* Role header */}
                                      <div
                                        onClick={() => toggleRole(roleKey)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '14px 16px',
                                          cursor: 'pointer',
                                          userSelect: 'none',
                                        }}
                                      >
                                        <div style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                                          {pos.roleType}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '16px' }}>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              addRole(startup.id, posIdx, startup.companyName, pos.roleType);
                                            }}
                                            disabled={added}
                                            style={{
                                              padding: '6px 14px',
                                              border: 'none',
                                              borderRadius: '6px',
                                              background: added ? '#e8f4ff' : '#0a468f',
                                              color: added ? '#0a468f' : 'white',
                                              fontSize: '12px',
                                              fontWeight: '600',
                                              cursor: added ? 'default' : 'pointer',
                                              whiteSpace: 'nowrap',
                                            }}
                                          >
                                            {added ? 'Added' : 'Add to Rankings'}
                                          </button>
                                          <span style={{
                                            fontSize: '14px',
                                            color: '#bbb',
                                            transition: 'transform 0.2s',
                                            transform: roleExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            lineHeight: 1,
                                          }}>
                                            &#9662;
                                          </span>
                                        </div>
                                      </div>

                                      {/* Role details */}
                                      {roleExpanded && (
                                        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #eee' }}>
                                          {pos.description && (
                                            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                                Description
                                              </div>
                                              <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                                                {pos.description}
                                              </p>
                                            </div>
                                          )}

                                          {pos.requiredSkills && pos.requiredSkills.length > 0 && (
                                            <div style={{ marginBottom: '16px' }}>
                                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                                Required Skills
                                              </div>
                                              <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                                                {pos.requiredSkills.join(', ')}
                                              </p>
                                            </div>
                                          )}

                                          {pos.timeCommitment && (
                                            <div>
                                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                                Time Commitment
                                              </div>
                                              <p style={{ fontSize: '14px', color: '#444', margin: 0 }}>
                                                {pos.timeCommitment}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p style={{ padding: '0 20px 20px', color: '#999', fontSize: '14px', fontStyle: 'italic' }}>No positions listed.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#0a468f',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  padding: 0,
};

const smallBtnStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  background: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  color: '#333',
};
