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

interface Recommendation {
  id: number;
  title: string;
  description: string;
  surveyUrl: string;
  status: 'active' | 'inactive'; // Status property
}

interface ScrollBarProps {
  recommendations: Recommendation[];
}

function ScrollBar({ recommendations }: ScrollBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollOffset;
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
              key={item.id}
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
                  component="a"
                  href={item.surveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    padding: '2px 6px', // Smaller padding
                    fontSize: '0.7rem', // Smaller font size
                    minWidth: 'unset', // Remove minimum width
                  }}
                >
                  Learn More
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
