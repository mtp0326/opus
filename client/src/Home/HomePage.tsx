import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Navbar from './Navbar';

function ImageRow() {
  const images = [
    {
      id: 1,
      src: '/assets/images/uptrend.png',
      caption: 'Higher payouts for respondents',
    },
    {
      id: 2,
      src: '/assets/images/clock.png',
      caption: 'Responses received quicker',
    },
    {
      id: 3,
      src: '/assets/images/message.png',
      caption: 'Higher quality responses',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center' /* Center the entire row */,
        alignItems: 'center',
        textAlign: 'center',
        marginTop: '30px',
        marginBottom: '50px',
        width: '100%',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto',
        gap: '320px' /* Ensures even spacing */,
      }}
    >
      {images.map((img) => (
        <div
          key={img.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1' /* Ensures equal space */,
            minWidth: '150px' /* Prevents uneven spacing */,
          }}
        >
          <img
            src={img.src}
            alt={`Icon ${img.id}`}
            style={{ width: '180px', height: 'auto', marginBottom: '20px' }}
          />
          <div
            style={{
              marginTop: '10px',
              fontSize: '16px',
              width: '300px' /* Keeps captions uniform */,
              textAlign: 'center',
              whiteSpace: 'normal',
              fontWeight: 'bold',
            }}
          >
            {img.caption}
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="home-page">
      <Navbar />

      <h1>Gamifying Data Collection</h1>
      <ImageRow />
      <p>
        Opus aims to revolutionize crowdsourcing by allowing greater rewards for
        respondents and by providing requesters with higher response rates and
        higher quality responses.
      </p>
      <button
        type="button"
        onClick={handleWorkerLogin}
        style={{ margin: '20px', padding: '10px 20px' }}
      >
        Start earning
      </button>
      <button
        type="button"
        onClick={handleResearcherLogin}
        style={{ margin: '20px', padding: '10px 20px' }}
      >
        Start requesting
      </button>
    </div>
  );
}

export default HomePage;
