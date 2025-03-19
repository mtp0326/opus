import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles1.css';

function HomePage() {
  const navigate = useNavigate();

  const handleWorkerLogin = () => {
    navigate('/wlogin');
  };

  const handleResearcherLogin = () => {
    navigate('/rlogin');
  };

  return (
    <div>
      <div
        data-collapse="medium"
        data-animation="default"
        data-duration="400"
        data-easing="ease"
        data-easing2="ease"
        role="banner"
        className="navigation w-nav"
      >
        <div className="container w-container">
          <nav role="navigation" className="nav-menu w-nav-menu">
            <a href="#features" className="nav-link w-nav-link">
              Features
            </a>
            <a href="/customers" className="nav-link w-nav-link">
              Customers
            </a>
            <a href="/signup" className="nav-link w-nav-link">
              Sign Up
            </a>
          </nav>
          <div className="logo-text">Opus</div>
          <div className="nav-link menu w-nav-button">
            <div className="w-icon-nav-menu" />
          </div>
        </div>
      </div>

      <div id="top" className="section main">
        <div className="w-container">
          <div className="w-row">
            <div className="w-col w-col-6">
              <h1 className="main-heading">Increase Survey Engagement 30%</h1>
              <p className="main-subtitle">
                With a built in suite of survey research tools and a worker
                focused experience, we make creating surveys easy and taking
                surveys fun
              </p>
              <button
                type="button"
                onClick={handleWorkerLogin}
                className="button"
              >
                Start Earning
              </button>
              <button
                type="button"
                onClick={handleResearcherLogin}
                className="button hollow"
              >
                Start Researching
              </button>
            </div>
            <div className="w-col w-col-6">
              <div>
                <img
                  className="main-image"
                  src="/assets/images/image1.png"
                  width="291"
                  alt="Opus Platform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="section">
        <div className="w-container">
          <h2>We are gamifying data collection</h2>
          <div className="section-subtitle">
            Everything you need to get insights for your business
          </div>
          <div className="feature-row w-row">
            <div className="w-col w-col-6">
              <img
                src="/assets/images/image2.png"
                alt="Gamification Features"
              />
            </div>
            <div className="w-col w-col-6">
              <div className="main-feature-group">
                <img
                  src="/assets/images/image3.svg"
                  height="30"
                  alt=""
                  className="feature-icon"
                />
                <h3>Fun, Addictive, Rewarding</h3>
                <p>
                  Our platform uses intermittent payouts, immersive sounds,
                  competitive streaks, and dynamic leagues to maximize
                  engagement while minimizing burnout. <br />
                  <br />
                  By turning survey completions into a competition with
                  performance based bonuses, we make every survey exciting,
                  every streak meaningful, and every reward worth the effort.
                </p>
              </div>
            </div>
          </div>
          <div className="feature-row w-row">
            <div className="w-col w-col-6">
              <div className="main-feature-group">
                <img
                  src="/assets/images/image4.svg"
                  height="30"
                  alt=""
                  className="feature-icon"
                />
                <h3>Faster in Every Way</h3>
                <p>
                  Opus&apos; drag and drop survey builder makes building complex
                  surveys with built in logic simple and ready to share in
                  minutes. <br />
                  <br />
                  We automate the creation of validation questions and can
                  detect unengaged users, accelerating the time it takes for you
                  to clean data and remove low quality responses.
                </p>
              </div>
            </div>
            <div className="w-col w-col-6">
              <div
                style={{ paddingTop: '56.17021276595745%' }}
                className="w-video w-embed"
              >
                <iframe
                  className="embedly-embed"
                  src="//cdn.embedly.com/widgets/media.html?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DmGDQRTcqhns&amp;type=text%2Fhtml&amp;schema=youtube&amp;display_name=YouTube&amp;src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FmGDQRTcqhns%3Ffeature%3Doembed"
                  width="940"
                  height="528"
                  scrolling="no"
                  allowFullScreen
                  title="Opus MTurk Speed"
                />
              </div>
            </div>
          </div>
          <div className="small-features-row w-row">
            <div className="w-col w-col-3">
              <div className="feature">
                <img
                  src="/assets/images/image5.svg"
                  height="30"
                  alt=""
                  className="feature-icon"
                />
                <h3>250,000 Workers</h3>
                <p>
                  We tap into the large worker base of Amazon Mechanical Turk
                  but remove the issue of survey abandonment by handling the
                  gamification for you
                </p>
              </div>
            </div>
            <div className="w-col w-col-3">
              <div className="feature">
                <img
                  src="/assets/images/image6.svg"
                  height="30"
                  alt=""
                  className="feature-icon"
                />
                <h3>Get Responses in Half the Time</h3>
                <p>
                  Our seamless UI, competitive reward system, and streaks keep
                  users working on the platform and cut the time it takes to
                  complete your tasks in half.
                </p>
              </div>
            </div>
            <div className="w-col w-col-3">
              <div className="feature">
                <img
                  src="/assets/images/image7.svg"
                  height="30"
                  alt=""
                  className="feature-icon"
                />
                <h3>70% Reduction in Data Cleaning Time</h3>
                <p>
                  By automating quality control with LLM generated attention
                  checks we score users live based on their focus and can
                  automatically flag low quality data
                </p>
              </div>
            </div>
            <div className="w-col w-col-3">
              <div className="feature">
                <img
                  src="/assets/images/image8.svg"
                  height="30"
                  alt=""
                  className="feature-icon"
                />
                <h3>Centralized Metrics</h3>
                <p>
                  From question bias detection to data collection, Opus handles
                  everything so that you have the easiest time getting your
                  research
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section footer">
        <div className="w-container">
          <div className="w-row">
            <div className="w-col w-col-6">
              <div className="logo-text footer">Opus</div>
            </div>
            <div className="w-col w-col-2" />
            <div className="w-col w-col-2" />
            <div className="w-col w-col-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
