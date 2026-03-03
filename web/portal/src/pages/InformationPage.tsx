import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Data for Students section
const studentHowItWorks = [
  {
    step: "01",
    title: "Apply once",
    description:
      "One application. Tell us your skills, interests, what you want to learn.",
  },
  {
    step: "02",
    title: "We interview strong candidates",
    description:
      "Behavioral + technical (when relevant). Last cohort: 300+ apps → 40 interviews → 20 accepted.",
  },
  {
    step: "03",
    title: "We match you to a startup",
    description:
      "Based on fit. Pre-seed to Series A. Tech, consumer, fintech, hardtech, health. NYC or remote.",
  },
  {
    step: "04",
    title: "You do meaningful work",
    description: "5-25 hrs/week, 8 weeks minimum. Projects with impact.",
  },
];

const studentWhyUs = [
  {
    title: "No job board grind",
    description:
      "Apply once. We find opportunities you'd never discover on your own.",
  },
  {
    title: "Vetted on both sides",
    description:
      "We screen students. We screen startups. Quality matches, not random placements.",
  },
  {
    title: "Work that matters",
    description:
      "Work directly with founders. Ship features. Talk to customers. Own outcomes.",
  },
  {
    title: "Built for learning",
    description:
      "Test if you like startups. Build specific skills. Get mentorship from people actually doing it.",
  },
  {
    title: "Flexible commitment",
    description:
      "8 weeks minimum. Many Fellows stay longer—some for over a year.",
  },
  {
    title: "Graduating seniors especially welcome",
    description:
      "Many startups are looking for full-time conversion potential.",
  },
];

const workTypes = [
  "Product development",
  "Marketing and growth strategy",
  "Business operations",
  "Software engineering",
  "UI/UX design and research",
  "Machine learning",
  "Hardware engineering",
  "Customer research",
  "Go-to-market experiments",
];

const studentFaqs = [
  {
    question: "Do I need startup experience?",
    answer:
      "No. Most Fellows don't. We're looking for capability and genuine interest.",
  },
  {
    question: "Do I need to be technical?",
    answer:
      "Not necessarily. We match technical and non-technical students to appropriate roles.",
  },
  {
    question: "How selective is this?",
    answer:
      "Depends on every cohort. Last cohort: ~15% acceptance rate. We encourage everyone to apply as everyone is unique and you might have a higher chance of a unique match for your profile.",
  },
  {
    question: "Will I get paid?",
    answer:
      "Depends on the startup. Some pay, some don't. We clarify before matching. If a startup doesn't provide compensation, you can apply for external support.",
  },
  {
    question: "What if I don't know what I want to do?",
    answer:
      "Tell us in the application. We'll match you to a startup where you can explore.",
  },
  {
    question: "Can I work remotely?",
    answer:
      "Yes, if the startup supports it. We match based on mutual preferences.",
  },
  {
    question: "What happens after 8 weeks?",
    answer:
      "You can keep working if both sides want to. Past Fellows have stayed 2-14 months, with some converting to full-time roles.",
  },
  {
    question: "I'm a graduating senior—can I apply?",
    answer:
      "Absolutely. Many startups are specifically looking for full-time conversion potential.",
  },
];

// Data for Startups section
const startupHowItWorks = [
  {
    step: "01",
    title: "Submit your role",
    description:
      "Tell us what you need: role type, required skills, time commitment, location preferences.",
  },
  {
    step: "02",
    title: "We find and vet candidates",
    description:
      "Campus-wide recruiting. Behavioral + technical interviews. You only see final matches.",
  },
  {
    step: "03",
    title: "You interview and decide",
    description:
      "We send you qualified candidates who we think might be a good match and you also talk to them before finalizing.",
  },
  {
    step: "04",
    title: "We check in",
    description: "Post-match support to ensure things run smoothly.",
  },
];

const startupWhyUs = [
  {
    title: "Reach you can't get elsewhere",
    description:
      "We're Columbia-embedded. Students come to us, not job boards. You access talent that wouldn't find you otherwise.",
  },
  {
    title: "Pre-screened pipeline",
    description:
      "Last cohort: 120 applications → 40 interviews → 20 accepted. We filter hard so you don't have to.",
  },
  {
    title: "Zero recruiting overhead",
    description:
      "No posting. No sorting applications. No scheduling chaos. We handle it.",
  },
  {
    title: "Quality at any stage",
    description:
      "Pre-seed or Series A, our students punch above what you'd normally access. Selectivity works in your favor.",
  },
];

const fellowProfiles = [
  {
    category: "Professional experience",
    examples: "Ex-NASA, ex-Deloitte, ex-Google",
  },
  {
    category: "Competition winners",
    examples:
      "Regeneron Scholars, International Math Olympiad finalists, HackMIT, DevFest, national-level hackathons",
  },
  {
    category: "Proven builders",
    examples:
      "Grew social accounts to 200k+ followers, generated millions in UGC views, collaborated with Hollywood composers",
  },
];

const startupFaqs = [
  {
    question: "What stage startups do you work with?",
    answer:
      "Pre-seed to Series A and beyond. NYC-based or remote. Any sector.",
  },
  {
    question: "Do we have to pay Fellows?",
    answer:
      "Compensation depends on you—stipend, hourly, equity, or unpaid. We clarify this before matching.",
  },
  {
    question: "How long do Fellows work with us?",
    answer:
      "Minimum 8 weeks, anywhere between 5-25 hrs/week. Many continue longer if both sides agree.",
  },
  {
    question: "What if we don't like the match?",
    answer:
      "We check in regularly. If it's not working, we'll help course-correct or find alternatives.",
  },
  {
    question: "How quickly can we get matched?",
    answer:
      "Typically 2-3 weeks from submission to interviews, depending on cohort timing.",
  },
];

// Accordion component
function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '672px' }}>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            style={{
              width: '100%',
              padding: '20px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '16px',
              fontWeight: '500',
              color: '#1f2937',
              fontFamily: 'inherit',
            }}
          >
            {item.question}
            <span style={{
              transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              fontSize: '12px',
            }}>
              ▼
            </span>
          </button>
          {openIndex === index && (
            <div style={{
              paddingBottom: '20px',
              color: '#6b7280',
              lineHeight: '1.6',
            }}>
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function InformationPage() {
  const navigate = useNavigate();

  const sectionStyle = {
    padding: '96px 24px',
    maxWidth: '1152px',
    margin: '0 auto',
  };

  const stepNumberStyle = {
    fontSize: '48px',
    fontWeight: '300',
    color: 'rgba(10, 70, 143, 0.3)',
    marginBottom: '16px',
    fontFamily: 'Georgia, serif',
  };

  const cardTitleStyle = {
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '12px',
    fontSize: '16px',
  };

  const cardDescStyle = {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '40px',
  };

  const labelStyle = {
    color: '#0a468f',
    fontWeight: '500',
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  };

  const headingStyle = {
    fontSize: '32px',
    fontWeight: '400',
    color: '#1f2937',
    marginBottom: '16px',
    fontFamily: 'Georgia, serif',
  };

  const subheadingStyle = {
    color: '#6b7280',
    maxWidth: '672px',
    lineHeight: '1.6',
  };

  const buttonStyle = {
    padding: '14px 28px',
    fontSize: '16px',
    cursor: 'pointer',
    background: '#0a468f',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 40px',
        background: 'var(--bg-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <img
          src="/logo.svg"
          alt="CORE Logo"
          style={{
            height: '36px',
            width: 'auto',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        />
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            background: '#0a468f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#083d7a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0a468f';
          }}
        >
          Sign In
        </button>
      </header>

      {/* For Students Section */}
      <section style={{ ...sectionStyle, borderTop: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '64px' }}>
          <p style={labelStyle}>For Students</p>
          <h2 style={headingStyle}>Work at startups. Skip the applications.</h2>
          <p style={subheadingStyle}>
            Get matched to a startup where you'll do real work that matters.
          </p>
        </div>

        {/* How It Works */}
        <div style={{ marginBottom: '96px' }}>
          <h3 style={sectionTitleStyle}>How It Works</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
          }}>
            {studentHowItWorks.map((item) => (
              <div key={item.step}>
                <p style={stepNumberStyle}>{item.step}</p>
                <h4 style={cardTitleStyle}>{item.title}</h4>
                <p style={cardDescStyle}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Us */}
        <div style={{ marginBottom: '96px' }}>
          <h3 style={sectionTitleStyle}>Why Us</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}>
            {studentWhyUs.map((item) => (
              <div key={item.title} style={{
                paddingLeft: '24px',
                borderLeft: '2px solid #0a468f',
              }}>
                <h4 style={cardTitleStyle}>{item.title}</h4>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What You Could Be Doing */}
        <div style={{ marginBottom: '96px' }}>
          <h3 style={sectionTitleStyle}>What You Could Be Doing</h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
          }}>
            {workTypes.map((type) => (
              <span
                key={type}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: '1px solid #0a468f',
                  color: '#1f2937',
                  fontSize: '14px',
                }}
              >
                {type}
              </span>
            ))}
          </div>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            You'll wear multiple hats. That's the point.
          </p>
        </div>

        {/* FAQs */}
        <div style={{ marginBottom: '48px' }}>
          <h3 style={sectionTitleStyle}>FAQs</h3>
          <Accordion items={studentFaqs} />
        </div>

        <button
          onClick={() => navigate('/register?type=student')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#083d7a';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0a468f';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Apply Now
          <span>→</span>
        </button>
      </section>

      {/* For Startups Section */}
      <section style={{
        ...sectionStyle,
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        maxWidth: 'none',
      }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div style={{ marginBottom: '64px' }}>
            <p style={labelStyle}>For Startups</p>
            <h2 style={headingStyle}>Find your next great hire</h2>
            <p style={subheadingStyle}>
              Access pre-vetted Columbia talent ready to make an impact at your startup.
            </p>
          </div>

          {/* How It Works */}
          <div style={{ marginBottom: '96px' }}>
            <h3 style={sectionTitleStyle}>How It Works</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '32px',
            }}>
              {startupHowItWorks.map((item) => (
                <div key={item.step}>
                  <p style={stepNumberStyle}>{item.step}</p>
                  <h4 style={cardTitleStyle}>{item.title}</h4>
                  <p style={cardDescStyle}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Us */}
          <div style={{ marginBottom: '96px' }}>
            <h3 style={sectionTitleStyle}>Why Us</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}>
              {startupWhyUs.map((item) => (
                <div key={item.title} style={{
                  paddingLeft: '24px',
                  borderLeft: '2px solid #0a468f',
                }}>
                  <h4 style={cardTitleStyle}>{item.title}</h4>
                  <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What Our Fellows Look Like */}
          <div style={{ marginBottom: '96px' }}>
            <h3 style={sectionTitleStyle}>What Our Fellows Look Like</h3>
            <div style={{ marginBottom: '32px' }}>
              {fellowProfiles.map((profile) => (
                <div
                  key={profile.category}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: '24px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    minWidth: '200px',
                  }}>
                    {profile.category}
                  </span>
                  <span style={{ color: '#6b7280' }}>{profile.examples}</span>
                </div>
              ))}
            </div>
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
              Technical and non-technical. Ready for meaningful work.
            </p>
          </div>

          {/* FAQs */}
          <div style={{ marginBottom: '48px' }}>
            <h3 style={sectionTitleStyle}>FAQs</h3>
            <Accordion items={startupFaqs} />
          </div>

          <button
            onClick={() => navigate('/register?type=startup')}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#083d7a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0a468f';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Submit Your Startup
            <span>→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-blue)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '13px',
          fontFamily: 'inherit',
        }}>
          <p style={{ margin: '2px 0' }}>
            © 2026 CORE - Columbia's Organization of Rising Entrepreneurs
          </p>
        </div>
      </footer>
    </div>
  );
}
