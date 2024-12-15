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
          justifyContent: 'flex-end',
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
        <Link to="/" style={{ textDecoration: 'none', mr: '1vw', height: '40px'}}>
          <Button
            sx={{
              height: '100%',
              backgroundColor: 'gray',
              color: 'white',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#646464'
              }
            }}
          >
            Log Out
          </Button>
        </Link>
      </Box>
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          height: "6vh",
          gap: "30px",
          alignItems: 'center',
          backgroundColor: '#800000',
        }}
      >
        <Link to="/home" style={{ textDecoration: 'none', display: 'flex', height: '100%'}}>
          <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#470000',
                transform: 'none',
              },
              height: '100%',
            }}
          >
            HOME
          </Button>
        </Link>
        <Link to="/registration" style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
        <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#470000',
                transform: 'none',
              },
            }}
          >
            REGISTRATION
          </Button>
        </Link>
        <Link to="/records" style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
        <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#470000',
                transform: 'none',
              },
            }}
          >
            STUDENT RECORDS
          </Button>
        </Link>
        <Link to="/employment" style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
        <Button 
            sx={{
              color: 'white',
              fontSize: '25px',
              '&:hover': {
                backgroundColor: '#470000',
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
