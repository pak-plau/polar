import React from "react";
import { Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const Records = () => {
  const otherRecords = [
    "Immunization Record",
    "Covid-19 Immunization Record",
    "Insurance Waivers",
    "FERPA Release Form"
  ];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
        padding: "2vh 0vh",
        overflowY: "auto",
      }}
    >
      <Card
        sx={{
          width: "80%",
          maxWidth: 600,
          backgroundColor: "#ffffff",
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            backgroundColor: "#800000",
            color: "#ffffff",
            p: 1,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Academic Records
          </Typography>
        </Box>
        <CardContent>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              justifyContent: "flex-start",
              color: "black",
              borderColor: "lightgray",
              mb: 1,
            }}
          >
            View Unofficial Transcript
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "lightgray",
              color: "black",
              '&:hover': {
                backgroundColor: "darkgray",
              },
            }}
          >
            Request Official Transcript
          </Button>
        </CardContent>
      </Card>
      <Card
        sx={{
          width: "80%",
          maxWidth: 600,
          backgroundColor: "#ffffff",
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            backgroundColor: "#800000",
            color: "#ffffff",
            p: 1,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Other Records
          </Typography>
        </Box>
        <CardContent>
          <Table>
            <TableBody>
              {otherRecords.map((record, idx) => (
                <TableRow key={idx}>
                  <TableCell>{record}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Records;
