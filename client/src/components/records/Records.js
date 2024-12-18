import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

const Records = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [otherRecords, setOtherRecords] = useState([]);

  const fetchUnofficialTranscript = async () => {
    try {
      const response = await fetch("http://localhost:8080/getUnofficialTranscript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "114640750" }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unofficial transcript");
      }
      const data = await response.json();
      setTranscript(Object.entries(data));
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setTranscript([]);
    }
  };

  const fetchGPA = async () => {
    try {
      const response = await fetch("http://localhost:8080/getGPA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "114640750" }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch GPA");
      }
      const data = await response.json();
      setGpa(data);
    } catch (error) {
      console.error("Error fetching GPA:", error);
      setGpa(null);
    }
  };

  const fetchOtherRecords = async () => {
    try {
      const response = await fetch("http://localhost:8080/getRecords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "114640750" }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch other records");
      }
      const data = await response.json();
      setOtherRecords(data || []);
    } catch (error) {
      console.error("Error fetching other records:", error);
      setOtherRecords([]);
    }
  };

  useEffect(() => {
    fetchOtherRecords();
  }, []);

  const downloadRecord = async (filename) => {
    try {
      const response = await fetch("http://localhost:8080/getRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "114640750", filename }),
      });

      if (!response.ok) {
        throw new Error("Failed to download record");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading record:", error);
    }
  };

  const handleDialogOpen = () => {
    fetchUnofficialTranscript();
    fetchGPA();
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

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
              color: "black",
              borderColor: "lightgray",
            }}
            onClick={handleDialogOpen}
          >
            View Unofficial Transcript
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
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => downloadRecord(record.slice(0, -4))}
                      fullWidth
                      sx={{
                        backgroundColor: 'white',
                        color: "black",
                        borderColor: "lightgray",
                      }}
                    >
                      {record.slice(0, -4)}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle sx={{ backgroundColor: "#800000", color: "white" }}>
          Unofficial Transcript
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", mt: 1, maxHeight: 400, overflowY: "auto" }}>
          {transcript.map((course) => {
            return (
              <DialogContentText sx={{ mt: 1, color: "black" }} key={course[0]}>
                {course[0]}: {course[1]}
              </DialogContentText>
            );
          })}
          <DialogContentText sx={{ mt: 1, color: "black", textAlign: "right" }}>
            GPA: {gpa ? gpa : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Records;
