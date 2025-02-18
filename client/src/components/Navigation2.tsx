import React from 'react';
import { AppBar, Toolbar, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Add font styles
const fontStyles = `
  @font-face {
    font-family: 'Feather Bold';
    src: url('/fonts/Feather-Bold.woff2') format('woff2'),
         url('/fonts/Feather-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
  }
`;

function Navigation2() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const clearStorage = () => {
    sessionStorage.removeItem('surveyFormData');
    sessionStorage.removeItem('comingFromPreview');
  };

  const handleNavigate = (path: string) => {
    clearStorage();
    navigate(path);
  };

  function NavButton({
    path,
    children,
  }: {
    path: string;
    children: React.ReactNode;
  }) {
    return (
      <button
        onClick={() => handleNavigate(path)}
        style={{
          fontFamily: 'Feather Bold',
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          margin: '0 4px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#58CC02',
        boxShadow: '0 4px 0 #58cc02',
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <NavButton path="/whome">Home</NavButton>
          <NavButton path="/wrecommended">Recommended</NavButton>
          <NavButton path="/leaderboard">Leagues</NavButton>
          <NavButton path="/account-info">Account Info</NavButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation2;
