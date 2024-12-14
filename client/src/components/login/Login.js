import React from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const Login = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#800000',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
              color: 'white',
              fontWeight: 'bold',
          }}
        >
          POLAR UNIVERSITY
        </Typography>
      </Box>
      <Box
        sx={{
          maxWidth: '600px',
          backgroundColor: 'white',
          paddingTop: 6,
          paddingBottom: 8,
          paddingLeft: 8,
          paddingRight: 8,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          LOGIN
        </Typography>
        <TextField label="Username" variant="outlined" fullWidth margin="normal" />
        <TextField label="Password" variant="outlined" fullWidth type="password" margin="normal" />
        <Button variant="contained" fullWidth 
          sx={{ 
            backgroundColor: 'gray', 
            marginTop: 2,
            height: "56px",
          }}
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
