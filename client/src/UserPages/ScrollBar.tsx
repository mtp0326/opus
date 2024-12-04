// src/components/ScrollBar.tsx

import React, { useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  _id: string;
  title: string;
  description: string;
  surveyUrl?: string;
  content?: any;
  surveyType?: 'surveyjs' | undefined;
  status: 'active' | 'inactive';
}

interface ScrollBarProps {
  recommendations: Recommendation[];
}

function ScrollBar({ recommendations }: ScrollBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollOffset;
    }
  };

  const handleAcceptWork = (item: Recommendation) => {
    if (item.surveyType === 'surveyjs') {
      navigate(`/take-survey-js/${item._id}`, {
        state: {
          formData: {
            title: item.title,
            description: item.description,
            content: item.content,
          },
        },
      });
    } else {
      navigate(`/take-survey-link/${item._id}`, {
        state: {
          formData: {
            title: item.title,
            description: item.description,
            surveyUrl: item.surveyUrl,
          },
        },
      });
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', mb: 4 }}>
      {/* Left Scroll Button */}
      <IconButton
        onClick={() => scroll(-300)}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.7)',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
        }}
        aria-label="Scroll Left"
      >
        <ChevronLeft />
      </IconButton>

      {/* Scroll Container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
          paddingLeft: '48px', // Space for left button
          paddingRight: '48px', // Space for right button
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'nowrap' }}>
          {recommendations?.map((item) => (
            <Card
              key={item._id}
              sx={{
                position: 'relative', // Make the card a containing block
                width: { xs: 150, sm: 200, md: 250 }, // Responsive widths
                aspectRatio: '3 / 2', // Enforce 3:2 aspect ratio
                marginRight: 2,
                flex: '0 0 auto',
                border: '4px solid',
                borderColor: 'primary.main',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{ paddingBottom: '40px' /* Adjust if necessary */ }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }} // Make the title bold
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>

              {/* Status at Bottom Left */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '14px',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Status:{' '}
                  <span
                    style={{
                      color: item.status === 'active' ? 'green' : 'red',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.status}
                  </span>
                </Typography>
              </Box>

              {/* Button at Bottom Right */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleAcceptWork(item)}
                  sx={{
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    minWidth: 'unset',
                  }}
                >
                  Accept and Work
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Right Scroll Button */}
      <IconButton
        onClick={() => scroll(300)}
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.7)',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
        }}
        aria-label="Scroll Right"
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
}

export default ScrollBar;
