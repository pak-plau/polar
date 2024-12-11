import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <Box>
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: 'white',
          color: 'black',
          padding: '10px',
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
            color: 'black',
            fontWeight: 'bold',
            fontSize: '18px',
            lineHeight: '40px',
            padding: '0 16px',
            borderRadius: '4px',
            marginLeft: 'auto',
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
          gap: "30px",
          alignItems: 'center',
          backgroundColor: '#800000',
        }}
      >
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <Button sx={{ color: 'white', fontSize: '25px' }}>
            HOME
          </Button>
        </Link>
        <Link to="/registration" style={{ textDecoration: 'none' }}>
          <Button sx={{ color: 'white', fontSize: '25px' }}>
            REGISTRATION
          </Button>
        </Link>
        <Link to="/records" style={{ textDecoration: 'none' }}>
          <Button sx={{ color: 'white', fontSize: '25px' }}>
            STUDENT RECORDS
          </Button>
        </Link>
        <Link to="/employment" style={{ textDecoration: 'none' }}>
          <Button sx={{ color: 'white', fontSize: '25px' }}>
            EMPLOYMENT SERVICES
          </Button>
        </Link>
      </Box>
    </Box>
  );
}

export default Dashboard;
