import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, }
from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Schedule from './Schedule';
import ClassInfo from './ClassInfo';

const formatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

function CartNoRowsOverlay() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        fontSize: "16px",
      }}
    >
      No classes in cart
    </Box>
  );
}

function SearchNoRowsOverlay() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        fontSize: "16px",
      }}
    >
      No classes found
    </Box>
  );
}

const Registration = () => {
  /* const [cartRows, setCartRows] = useState([
    { id: 1, class: 'CSE', code: '316', section: '01', days: 'TR', timeStart: new Date(2003, 0, 30, 11), timeEnd: new Date(2003, 0, 30, 12, 20), room: 'JLC 102', instructor: 'Christopher Kane', credits: 3.0 },
    { id: 2, class: 'CSE', code: '320', section: '01', days: 'TR', timeStart: new Date(2003, 0, 30, 17, 30), timeEnd: new Date(2003, 0, 30, 18, 50), room: 'JLC 110', instructor: 'Howard Stark', credits: 3.0 },
    { id: 3, class: 'CSE', code: '385', section: '01', days: 'MWF', timeStart: new Date(2003, 0, 30, 13), timeEnd: new Date(2003, 0, 30, 13, 55), room: 'NCS 220', instructor: 'Michael Bender', credits: 3.0 },
  ]); */
  const [cartRows, setCartRows] = useState([]);
  const [searchRows, setSearchRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflictClass, setConflictClass] = useState(null);

  const handleDeleteRow = (id) => {
    setCartRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleAddRow = async (id) => {
    const selectedClass = searchRows.find((row) => row.id === id);
  
    if (!selectedClass) {
      console.error("Selected class not found.");
      return;
    }
    const duplicateClass = cartRows.find(
      (cartRow) =>
        cartRow.class === selectedClass.class &&
        cartRow.code === selectedClass.code
    );
    if (duplicateClass) {
      setConflictClass({
        ...duplicateClass,
        conflictMessage: `A class with the same name (${duplicateClass.class} ${duplicateClass.code}-${duplicateClass.section}) is already in your cart.`,
        conflictHeader: "Duplicate Class",
      });
      setDialogOpen(true);
      return;
    }
    const timeConflict = cartRows.find((cartRow) =>
      selectedClass.days.split("").some(
        (day) =>
          cartRow.days.includes(day) &&
          ((selectedClass.timeStart >= cartRow.timeStart &&
            selectedClass.timeStart < cartRow.timeEnd) ||
            (selectedClass.timeEnd > cartRow.timeStart &&
              selectedClass.timeEnd <= cartRow.timeEnd) ||
            (selectedClass.timeStart <= cartRow.timeStart &&
              selectedClass.timeEnd >= cartRow.timeEnd))
      )
    );
    if (timeConflict) {
      setConflictClass({
        ...timeConflict,
        conflictMessage: `The class you're trying to add conflicts with: ${timeConflict.class} ${timeConflict.code}-${timeConflict.section}.`,
        conflictHeader: "Time Conflict",
      });
      setDialogOpen(true);
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/checkPrereq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prereq: selectedClass.prereq }),
      });
      if (response.ok) {
        setCartRows((prevRows) => [...prevRows, selectedClass]);
      } else if (response.status === 409) {
        const errorData = await response.json();
        setConflictClass({
          conflictMessage:
            errorData.error || "You do not meet the prerequisites for this class.",
          conflictHeader: "Prerequisite Error",
        });
        setDialogOpen(true);
      } else {
        console.error("Failed to check prerequisites:", response.statusText);
        setConflictClass({
          conflictMessage: "An unexpected error occurred while checking prerequisites.",
          conflictHeader: "Server Error",
        });
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error during prerequisite check:", error);
      setConflictClass({
        conflictMessage: "A network error occurred while checking prerequisites.",
        conflictHeader: "Network Error",
      });
      setDialogOpen(true);
    }
  };  

  const handleDialogClose = () => {
    setDialogOpen(false);
    setConflictClass(null);
  };

  const getInitialAndRest = (name) => {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0][0];
    const restOfName = nameParts.slice(1).join(' ');
    return firstInitial + '. ' + restOfName;
  };

  const displayRows = (rows) => {
    return rows.map((row) => ({
      id: row.id,
      class: `${row.class} ${row.code}-${row.section}`,
      time: `${row.days} ${formatter.format(row.timeStart)} - ${formatter.format(row.timeEnd)}`,
      room: row.room,
      instructor: getInitialAndRest(row.instructor),
      credits: row.credits,
    }));
  };

  const handleSearchKeyPress = async (event) => {
    if (event.key === 'Enter' && searchQuery.length > 0) {
      try {
        setSearchRows([]);
        const response = await fetch('http://localhost:8080/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchQuery }),
        });
        if (response.ok) {
          const data = await response.json();
          const processedData = data.map(item => {
            if (Array.isArray(item.class)) {
              item.class = item.class.join('/');
            }
            if (item.timeStart) {
              item.timeStart = new Date(item.timeStart);
            }
            if (item.timeEnd) {
              item.timeEnd = new Date(item.timeEnd);
            }
            return item;
          });
          console.log(processedData);
          setSearchRows(processedData);
        } else {
          console.error('Search request failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error during search request:', error);
      }
    }
  };  
  
  const totalCredits = cartRows.reduce((total, row) => total + row.credits, 0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 2,
        gap: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ width: '40vw' }}>
        <CardHeader title="Cart" sx={{ backgroundColor: '#800000', color: '#fff', p: 1 }} titleTypographyProps={{ variant: 'h6' }} />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
          <DataGrid
            rows={displayRows(cartRows)}
            columns={[
              { field: 'class', headerName: 'Class', flex: 1.25 },
              { field: 'time', headerName: 'Days/Times', flex: 2 },
              { field: 'room', headerName: 'Room', flex: 1 },
              { field: 'instructor', headerName: 'Instructor', flex: 1 },
              { field: 'credits', headerName: 'Credits', flex: 0.75, type: 'number', align: 'center', headerAlign: 'center' },
              {
                field: 'delete',
                headerName: '',
                flex: 0.65,
                renderCell: (params) => (
                  <Button onClick={() => handleDeleteRow(params.id)} sx={{ backgroundColor: '#800000', color: '#fff', minWidth: 36 }}>
                    <DeleteIcon />
                  </Button>
                ),
              },
            ]}
            hideFooter
            disableColumnMenu
            disableColumnResize
            disableColumnSorting
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none',
              },
            }}
            slots={{
              noRowsOverlay: CartNoRowsOverlay
            }}
          />
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            Total Credits: {totalCredits}
          </Typography>
          <Schedule rows={cartRows} />
        </CardContent>
      </Card>
      <Card sx={{ width: '40vw' }}>
        <CardHeader title="Class Search" sx={{ backgroundColor: '#800000', color: '#fff', p: 1 }} titleTypographyProps={{ variant: 'h6' }} />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography
              variant="subtitle2"
            >
              Put brackets around SBCs to search for them. Ex: [SPK]
            </Typography>
            <TextField
              label="Search Classes"
              fullWidth
              margin="normal"
              variant="outlined"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={handleSearchKeyPress}
              sx={{
                m: 0,
              }}
            />
          </Box>
          <DataGrid
            rows={displayRows(searchRows)}
            columns={[
              { field: 'class', headerName: 'Class', flex: 1.25 },
              { field: 'time', headerName: 'Days/Times', flex: 2 },
              { field: 'room', headerName: 'Room', flex: 1 },
              { field: 'instructor', headerName: 'Instructor', flex: 1 },
              { field: 'credits', headerName: 'Credits', flex: 0.75, type: 'number', align: 'center', headerAlign: 'center' },
              {
                field: 'delete',
                headerName: '',
                flex: 0.65,
                renderCell: (params) => (
                  <Button onClick={() => handleAddRow(params.id)} sx={{ backgroundColor: '#800000', color: '#fff', minWidth: 36 }}>
                    <AddIcon />
                  </Button>
                ),
              },
            ]}
            hideFooter
            disableColumnMenu
            disableColumnResize
            disableColumnSorting
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none',
              },
            }}
            slots={{
              noRowsOverlay: SearchNoRowsOverlay
            }}
          />
          {searchRows
            .filter((row, index, self) => 
              self.findIndex((r) => r.class === row.class && r.code === row.code) === index
            )
            .map((row) => (
              <ClassInfo
                class1={row.class}
                code={row.code}
                section={row.section}
                title={row.title}
                description={row.description}
                prereq={row.prereq}
                sbc={row.sbc}
              />
          ))}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle sx={{ backgroundColor: '#800000', color: 'white' }}>{conflictClass?.conflictHeader}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <DialogContentText sx={{ mt: 2, color: 'black' }}>
            {conflictClass?.conflictMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose}
            color="primary"
            sx={{
              backgroundColor: 'gray',
              color: 'white',
              '&:hover': {
                backgroundColor: '#646464',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Registration;
