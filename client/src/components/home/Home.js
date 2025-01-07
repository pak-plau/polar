import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Table, TableBody, TableRow, TableCell } from "@mui/material";
import config from "../../config.js";

const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: "UTC" });

const Home = () => {
  const [enrollmentDate, setEnrollmentDate] = useState(null);
  const [housingDate, setHousingDate] = useState(null);

  const holds = ["Mandatory Health Insurance"];
  const todo = ["Complete Health Waiver by August 26th, 2024"];
  const id = localStorage.getItem("user").slice(1, -1);
  
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const enrollmentResponse = await fetch(`${config.serverUrl}/getEnrollmentDate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }),
        });
        if (!enrollmentResponse.ok) {
          throw new Error("Failed to fetch enrollment date");
        }
        const enrollmentData = await enrollmentResponse.json();
        setEnrollmentDate(new Date(enrollmentData));
        const housingResponse = await fetch(`${config.serverUrl}/getHousingDate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }),
        });
        if (!housingResponse.ok) {
          throw new Error("Failed to fetch housing date");
        }
        const housingData = await housingResponse.json();
        setHousingDate(new Date(housingData));
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    fetchDates();
  }, []);

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
            Holds
          </Typography>
        </Box>
        <CardContent>
          <Table>
            <TableBody>
              {holds.map((hold, idx) => (
                <TableRow key={idx}>
                  <TableCell>{hold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            To Do List
          </Typography>
        </Box>
        <CardContent>
          <Table>
            <TableBody>
              {todo.map((task, idx) => (
                <TableRow key={idx}>
                  <TableCell>{task}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            Dates
          </Typography>
        </Box>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>{`Class Enrollment: ${formatter.format(enrollmentDate)}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{`Housing Registration: ${formatter.format(housingDate)}`}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Home;
