import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <Box
      sx={{
        height: "13vh"
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          height: "7vh",
          justifyContent: 'flex-start',
          alignItems: 'center',
          color: 'black',
          position: 'relative',
        }}
      >
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <Typography
            variant="h3"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'black',
            }}
          >
            POLAR UNIVERSITY
          </Typography>
        </Link>
        <Button
          variant="contained"
          sx={{
            height: '40px',
            backgroundColor: 'gray',
            borderRadius: '4px',
            marginLeft: 'auto',
            marginRight: '1vw',
            '&:hover': {
              backgroundColor: '#646464'
            }
          }}
          onClick={() => alert('Logging out')}
        >
          Log Out
        </Button>
      </Box>
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          height: "6.5vh",
          gap: "30px",
          alignItems: 'center',
          backgroundColor: '#800000',
        }}
      >
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#6b0000',
                transform: 'none',
              },
            }}
          >
            HOME
          </Button>
        </Link>
        <Link to="/registration" style={{ textDecoration: 'none' }}>
        <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#6b0000',
                transform: 'none',
              },
            }}
          >
            REGISTRATION
          </Button>
        </Link>
        <Link to="/records" style={{ textDecoration: 'none' }}>
        <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#6b0000',
                transform: 'none',
              },
            }}
          >
            STUDENT RECORDS
          </Button>
        </Link>
        <Link to="/employment" style={{ textDecoration: 'none' }}>
        <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#6b0000',
                transform: 'none',
              },
            }}
          >
            EMPLOYMENT SERVICES
          </Button>
        </Link>
      </Box>
    </Box>
  );
}

export default Dashboard;
