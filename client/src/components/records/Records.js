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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField
} from "@mui/material";

const Records = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [otherRecords, setOtherRecords] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedRecordType, setSelectedRecordType] = useState("Covid-19 Immunization Record");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "114640750" }),
      });
      if (!response.ok) throw new Error("Failed to fetch other records");
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

  const handleUploadDialogOpen = () => setOpenUploadDialog(true);
  const handleUploadDialogClose = () => {
    setOpenUploadDialog(false);
    setFile(null);
    setFileName("");
  };

  const handleRecordTypeChange = (event) => setSelectedRecordType(event.target.value);
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("id", "123456789");
    formData.append("file", file);
    formData.append("filename", selectedRecordType);
    try {
      const response = await fetch("http://localhost:8080/putRecord", {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      handleUploadDialogClose();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };  

  const downloadRecord = async (filename) => {
    try {
      const response = await fetch("http://localhost:8080/getRecord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "114640750", filename: filename }),
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
      <Card sx={{ width: "80%", maxWidth: 600, borderRadius: 1, boxShadow: 3 }}>
        <Box sx={{ backgroundColor: "#800000", color: "#fff", p: 1, borderRadius: "4px 4px 0 0" }}>
          <Typography variant="h6" fontWeight="bold">Academic Records</Typography>
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
          >View Unofficial Transcript</Button>
        </CardContent>
      </Card>
      <Card sx={{ width: "80%", maxWidth: 600, borderRadius: 1, boxShadow: 3 }}>
        <Box
          sx={{
            backgroundColor: "#800000",
            color: "#fff",
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: "4px 4px 0 0",
          }}
        >
          <Typography variant="h6" fontWeight="bold">Other Records</Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "gray",
              "&:hover": { backgroundColor: "#646464" },
            }}
            onClick={handleUploadDialogOpen}
          >
            Upload
          </Button>
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
                        backgroundColor: "white",
                        color: "black",
                        borderColor: "lightgray" }}
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
      <Dialog open={openUploadDialog} onClose={handleUploadDialogClose}>
        <DialogTitle sx={{ backgroundColor: "#800000", color: "white" }}>Upload Record</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <FormControl>
            <RadioGroup value={selectedRecordType} onChange={handleRecordTypeChange}>
              <FormControlLabel value="Covid-19 Immunization Record" control={<Radio />} label="Covid-19 Immunization Record" />
              <FormControlLabel value="FERPA Release Form" control={<Radio />} label="FERPA Release Form" />
              <FormControlLabel value="Immunization Record" control={<Radio />} label="Immunization Record" />
              <FormControlLabel value="Insurance Waiver Form" control={<Radio />} label="Insurance Waiver Form" />
            </RadioGroup>
          </FormControl>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-upload"
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                sx={{
                  fontSize: ".75rem",
                  textAlign: "center",
                  backgroundColor: "#800000",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#470000" },
                }}
              >
                Choose File
              </Button>
            </label>
            <TextField
              value={fileName}
              label="File Name"
              type="text"
              fullWidth
              variant="outlined"
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{
                color: "#000000",
                backgroundColor: "#ffffff",
                borderColor: "black",
                input: {
                  color: "#000000",
                },
                "& .MuiInputLabel-root": {
                  color: "#000000",
                },
              }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleUploadDialogClose}
            sx={{
              backgroundColor: "gray",
              color: "white",
              "&:hover": { backgroundColor: "#646464" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file}
            sx={{
              backgroundColor: file ? "#800000" : "white",
              color: "white",
              "&:hover": { backgroundColor: "#470000" },
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Records;
