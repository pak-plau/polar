import React from "react";
import { Box, Card, CardContent, Typography, Table, TableBody, TableRow, TableCell } from "@mui/material";

const Home = () => {
  const holds = ["Mandatory Health Insurance"]
  const todo = ["Complete Health Waiver by 8/26"]
  const dates = ["Class Enrollment: February 2nd 2024, 12pm", "Housing Registration: April 6th 2024, 3pm"]

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
              {dates.map((date, idx) => (
                <TableRow key={idx}>
                  <TableCell>{date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Home;
