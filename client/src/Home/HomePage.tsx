import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

function HomePage() {
  const navigate = useNavigate();
  // const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  const handleWorkerLogin = () => {
    navigate('/wlogin');
  };

  const handleResearcherLogin = () => {
    navigate('/rlogin');
  };

  return (
    <div style={{ textAlign: 'center'}}>
      <Navbar />

      <h1>Gamifying Data Collection</h1>
      <p>Opus aims to revolutionize crowdsourcing by allowing greater rewards 
        for respondents and by providing requesters with higher response rates 
        and higher quality responses.</p>
      <button
        type="button"
        onClick={handleWorkerLogin}
        style={{ margin: '10px', padding: '10px 20px' }}
      >
        Start earning
      </button>
      <button
        type="button"
        onClick={handleResearcherLogin}
        style={{ margin: '10px', padding: '10px 20px' }}
      >
        Start requesting
      </button>
    </div>
  );
}

export default HomePage;