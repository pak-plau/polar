import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Typography, Card, Box, CardContent, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Employment = () => {

  const calculateHours = (timeIn, timeOut) => {
    return (timeOut - timeIn) / 1000 / 60 / 60; // Difference in hours
  };

  const returnTimeStr = (dateTime) => {
    let hours = dateTime.getHours();
    let minutes = dateTime.getMinutes();
    let suffix = hours < 12 ? 'AM' : 'PM';
    hours %= 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}${suffix}`;
  }

  const displayRows = (rows) => {
    return rows.map((row, index) => ({
      id: index,
      date: `${row.timeIn.getMonth() + 1}/${row.timeIn.getDate()}/${row.timeIn.getFullYear()}`,
      timeIn: returnTimeStr(row.timeIn),
      timeOut: returnTimeStr(row.timeOut),
      hours: calculateHours(row.timeIn, row.timeOut),
      status: row.status
    }));
  }

  const [rows, setRows] = useState([
    { timeIn: new Date(2024, 4, 8, 9), timeOut: new Date(2024, 4, 8, 17), status: '' },
    { timeIn: new Date(2024, 4, 9, 9), timeOut: new Date(2024, 4, 9, 17), status: '' },
  ]);

  const columns = [
    { field: 'date', headerName: 'Date', flex: 2 },
    { field: 'timeIn', headerName: 'Time In', flex: 2 },
    { field: 'timeOut', headerName: 'Time Out', flex: 2 },
    { field: 'hours', headerName: 'Hours', flex: 1, type: 'number', align: 'center', headerAlign: 'center' },
    { field: 'status', headerName: 'Status', flex: 1, align: 'center', headerAlign: 'center' },
    {
      field: 'delete', 
      headerName: '',
      flex: 1, 
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => handleDeleteRow(params.id)}
          sx={{
            backgroundColor: "#800000",
            color: "white",
            fontWeight: 'bold',
            padding: 1,
            minWidth: 'auto',
            width: 36,
            height: 36,
            '&:hover': {
              backgroundColor: '#6b0000'
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </Button>
      ),
    },
  ];

  const totalHours = displayRows(rows).reduce((total, row) => total + row.hours, 0);

  const handleDeleteRow = (id) => {
    // Filter out the row with the matching id
    setRows(prevRows => prevRows.filter(row => row.timeIn.getTime() !== id));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: "2vh 0vh",
        overflowY: "auto",
      }}
    >
      <Card
        sx={{
          width: 600,
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
            borderTopRightRadius: 4
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Timesheet
          </Typography>
        </Box>
        <CardContent>
          <DataGrid
            rows={displayRows(rows)}
            columns={columns}
            hideFooter='true'
            disableColumnMenu
            disableColumnResize
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              gap: 2,
              marginTop: 2,
              width: '100%',
            }}
          >
            <Typography variant="body1" component="div" gutterBottom>
              Total Hours: {totalHours.toFixed(2)}
            </Typography>
            <Button variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Employment;
