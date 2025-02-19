import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './home.css';
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

  const images = [
    { src: "/assets/images/uptrend.png", caption: "Higher payouts for respondents" },
    { src: "/assets/images/clock.png", caption: "Responses received quicker" },
    { src: "/assets/images/message.png", caption: "Higher quality responses" }
  ];

  
  const ImageRow = () => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",  /* Center the entire row */
            alignItems: "center",
            textAlign: "center",
            marginTop: "30px",
            marginBottom: "50px",
            width: "100%",
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto",
            gap: "320px"  /* Ensures even spacing */
        }}>
            {images.map((img, index) => (
                <div key={index} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: "1",  /* Ensures equal space */
                    minWidth: "150px" /* Prevents uneven spacing */
                }}>
                    <img src={img.src} alt={`Icon ${index + 1}`} style={{ width: "180px", height: "auto", marginBottom: "20px" }} />
                    <div style={{
                        marginTop: "10px",
                        fontSize: "16px",
                        width: "300px",  /* Keeps captions uniform */
                        textAlign: "center",
                        whiteSpace: "normal",
                        fontWeight: "bold"
                    }}>
                        {img.caption}
                    </div>
                </div>
            ))}
        </div>
    );
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
