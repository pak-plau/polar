import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import config from "../../config.js";

const Login = () => {
  const [polarId, setPolarId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    try {
      const response = await fetch(`${config.serverUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: polarId, pass: password }),
      });
      if (response.status === 404) {
        setError("Polar ID does not exist");
      } else if (response.status === 409) {
        setError("Wrong password");
      } else if (response.status === 200) {
        await login(polarId)
      } else {
        setError("An unexpected error occurred");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    }
  };

  return (
    <Box
      sx={{
        mt: "10vh",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#800000",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          POLAR UNIVERSITY
        </Typography>
      </Box>
      <Box
        sx={{
          maxWidth: "600px",
          backgroundColor: "white",
          paddingTop: 6,
          paddingBottom: 8,
          paddingLeft: 8,
          paddingRight: 8,
          borderRadius: 2,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="POLAR ID"
          fullWidth
          margin="normal"
          value={polarId}
          onChange={(e) => setPolarId(e.target.value)}
          error={error === "Polar ID does not exist"}
        />
        <TextField
          label="Password"
          fullWidth
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error === "Wrong password"}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={{
            backgroundColor: "#800000",
            mt: 2,
            height: "56px",
            ":hover": {
              backgroundColor: "#470000",
            },
          }}
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
