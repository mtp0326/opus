import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function HomePage() {
  const navigate = useNavigate();

  const handleWorkerLogin = () => {
    navigate('/wlogin');
  };

  const handleResearcherLogin = () => {
    navigate('/rlogin');
  };

  return (
    <div
      style={{
        backgroundColor: '#0F1E17',
        color: '#FFFFFF',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '100px 20px 60px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          Gamifying Data Collection
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            maxWidth: '800px',
            lineHeight: '1.6',
            marginBottom: '40px',
          }}
        >
          Opus aims to revolutionize crowdsourcing by allowing greater rewards
          for respondents and by providing requesters with higher response rates
          and higher quality responses.
        </p>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '60px' }}>
          <button
            type="button"
            onClick={handleWorkerLogin}
            style={{
              backgroundColor: '#06D6A0',
              color: '#0F1E17',
              padding: '14px 28px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(6,214,160, 0.3)',
            }}
          >
            Start Earning
          </button>
          <button
            type="button"
            onClick={handleResearcherLogin}
            style={{
              backgroundColor: '#06D6A0',
              color: '#0F1E17',
              padding: '14px 28px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(6,214,160, 0.3)',
            }}
          >
            Start Requesting
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '40px',
          justifyContent: 'center',
          padding: '0 20px 80px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Feature 1 */}
        <div
          style={{
            flex: '1 1 250px',
            minWidth: '250px',
            maxWidth: '300px',
            textAlign: 'center',
          }}
        >
          <img
            src="/assets/images/uptrend.png"
            alt="Higher payouts icon"
            style={{ width: '80px', height: 'auto', marginBottom: '20px' }}
          />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Higher payouts for respondents
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#D0D0D0', lineHeight: '1.5' }}>
            Earn more by providing valuable insights on tasks, surveys, and
            studies.
          </p>
        </div>

        {/* Feature 2 */}
        <div
          style={{
            flex: '1 1 250px',
            minWidth: '250px',
            maxWidth: '300px',
            textAlign: 'center',
          }}
        >
          <img
            src="/assets/images/clock.png"
            alt="Faster response icon"
            style={{ width: '80px', height: 'auto', marginBottom: '20px' }}
          />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Responses received quicker
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#D0D0D0', lineHeight: '1.5' }}>
            Get your surveys filled out in record time with our large,
            engaged community.
          </p>
        </div>

        {/* Feature 3 */}
        <div
          style={{
            flex: '1 1 250px',
            minWidth: '250px',
            maxWidth: '300px',
            textAlign: 'center',
          }}
        >
          <img
            src="/assets/images/message.png"
            alt="Quality responses icon"
            style={{ width: '80px', height: 'auto', marginBottom: '20px' }}
          />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            Higher quality responses
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#D0D0D0', lineHeight: '1.5' }}>
            Thorough and accurate data that makes your research or tasks more
            effective.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
