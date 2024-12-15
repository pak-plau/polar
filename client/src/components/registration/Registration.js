import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, }
from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Schedule from './Schedule';
import ClassInfo from './ClassInfo';

const formatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const Registration = () => {
  const [cartRows, setCartRows] = useState([
    { id: 1, class: 'CSE', code: '316', section: '01', days: 'TR', timeStart: new Date(2024, 11, 2, 11), timeEnd: new Date(2024, 11, 2, 12, 20), room: 'JLC 102', instructor: 'Christopher Kane', credits: 3.0 },
    { id: 2, class: 'CSE', code: '320', section: '01', days: 'TR', timeStart: new Date(2024, 11, 2, 17, 30), timeEnd: new Date(2024, 11, 2, 18, 50), room: 'JLC 110', instructor: 'Howard Stark', credits: 3.0 },
    { id: 3, class: 'CSE', code: '385', section: '01', days: 'MWF', timeStart: new Date(2024, 11, 2, 13), timeEnd: new Date(2024, 11, 2, 13, 55), room: 'NCS 220', instructor: 'Michael Bender', credits: 3.0 },
  ]);

  const [searchRows, setSearchRows] = useState([
    { id: 4, class: 'CSE', code: '310', section: '01', days: 'MW', timeStart: new Date(2024, 11, 2, 16), timeEnd: new Date(2024, 11, 2, 17, 20), room: 'HUM 1003', instructor: 'Shubham Jain', credits: 3.0 },
    { id: 5, class: 'CSE', code: '385', section: '01', days: 'TR', timeStart: new Date(2024, 11, 2, 17, 30), timeEnd: new Date(2024, 11, 2, 18, 50), room: 'JLC 110', instructor: 'Howard Stark', credits: 3.0 },
    { id: 6, class: 'CSE', code: '320', section: '01', days: 'MWF', timeStart: new Date(2024, 11, 2, 13), timeEnd: new Date(2024, 11, 2, 13, 55), room: 'NCS 220', instructor: 'Michael Bender', credits: 3.0 },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflictClass, setConflictClass] = useState(null);

  const handleDeleteRow = (id) => {
    setCartRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleAddRow = (id) => {
    const selectedClass = searchRows.find((row) => row.id === id);

    const conflict = cartRows.find((cartRow) =>
      selectedClass.days.split('').some((day) =>
        cartRow.days.includes(day) &&
        ((selectedClass.timeStart >= cartRow.timeStart && selectedClass.timeStart < cartRow.timeEnd) ||
          (selectedClass.timeEnd > cartRow.timeStart && selectedClass.timeEnd <= cartRow.timeEnd) ||
          (selectedClass.timeStart <= cartRow.timeStart && selectedClass.timeEnd >= cartRow.timeEnd))
      )
    );

    if (conflict) {
      setConflictClass(conflict);
      setDialogOpen(true);
    } else {
      setCartRows((prevRows) => [...prevRows, selectedClass]);
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
          <TextField
            label="Search Classes"
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{
              m: 0,
            }}
          />
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
          />
          <ClassInfo />
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle sx={{ backgroundColor: '#800000', color: 'white' }}>Time Conflict</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <DialogContentText sx={{ mt: 2 }}>
            The class you're trying to add conflicts with: {conflictClass?.class} {conflictClass?.code}-{conflictClass?.section}.
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
