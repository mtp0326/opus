import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Opus</h1>
      <button
        onClick={handleWorkerLogin}
        style={{ margin: '10px', padding: '10px 20px' }}
      >
        Start earning
      </button>
      <button
        onClick={handleResearcherLogin}
        style={{ margin: '10px', padding: '10px 20px' }}
      >
        Start requesting
      </button>
    </div>
  );
}

export default HomePage;
