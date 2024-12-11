import React from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';

const Home = () => {
  return (
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
              color: 'black',
              fontWeight: 'bold',
          }}
        >
          Registration
        </Typography>
      </Box>

  );
};

export default Home;
