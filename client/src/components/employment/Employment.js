import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Typography, Card, Box, CardContent, Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const Employment = () => {
  const [rows, setRows] = useState([
    { id: 0, timeIn: new Date(2024, 4, 8, 9), timeOut: new Date(2024, 4, 8, 17), status: '' },
    { id: 1, timeIn: new Date(2024, 4, 9, 9), timeOut: new Date(2024, 4, 9, 17), status: '' },
  ]);
  const [addOpened, setAddOpened] = useState(false);
  const [date, setDate] = useState(null);
  const [timeIn, setTimeIn] = useState(null);
  const [timeOut, setTimeOut] = useState(null);
  const [dateError, setDateError] = useState(false);
  const [timeInError, setTimeInError] = useState(false);
  const [timeOutError, setTimeOutError] = useState(false);
  const [timeOutBefore, setTimeOutBefore] = useState(false); // New state for Time Out error message

  const openAdd = () => {
    setAddOpened(true);
  };

  const closeAdd = () => {
    setDate(null);
    setTimeIn(null);
    setTimeOut(null);
    setDateError(false);
    setTimeOutError(false);
    setTimeOutBefore(false);
    setAddOpened(false);
  };

  const handleDateError = (error) => {
    setDateError(error);
    console.log(error);
  };

  const handleTimeInError = (error) => {
    setTimeInError(error);
    console.log(error);
  };

  const handleTimeOutError = (error) => {
    setTimeOutError(error);
    console.log(error);
  };

  // New function to validate if timeOut is after timeIn
  const validateTimeOut = (timeIn, timeOut) => {
    setTimeOutBefore(timeIn && timeOut && timeOut <= timeIn);
  };

  // This will run whenever timeOut or timeIn changes
  React.useEffect(() => {
    validateTimeOut(timeIn, timeOut);
  }, [timeIn, timeOut]);

  const dateErrorMessage = React.useMemo(() => {
    switch (dateError) {
      case 'disableFuture': {
        return 'Please input a date in the past/present';
      }
      case 'invalidDate': {
        return 'Please input a valid date';
      }
      default: {
        return '';
      }
    }
  }, [dateError]);

  const timeInErrorMessage = React.useMemo(() => {
    switch (timeInError) {
      case 'minutesStep': {
        return 'Please input minutes in increments of 15';
      }
      case 'invalidDate': {
        return 'Please input a valid time';
      }
      default: {
        return '';
      }
    }
  }, [timeInError]);

  const timeOutErrorMessage = React.useMemo(() => {
    switch (timeOutError) {
      case 'minutesStep': {
        return 'Please input minutes in increments of 15';
      }
      case 'invalidDate': {
        return 'Please input a valid time';
      }
      default: {
        return '';
      }
    }
  }, [timeOutError]);

  const calculateHours = (timeIn, timeOut) => {
    return (timeOut - timeIn) / 1000 / 60 / 60;
  };

  const returnTimeStr = (dateTime) => {
    let hours = dateTime.getHours();
    let minutes = dateTime.getMinutes();
    let suffix = hours < 12 ? 'AM' : 'PM';
    hours %= 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}${suffix}`;
  };

  const displayRows = (rows) => {
    return rows.map((row) => ({
      id: row.id,
      date: row.id !== 'add' ? `${row.timeIn.getMonth() + 1}/${row.timeIn.getDate()}/${row.timeIn.getFullYear()}` : '',
      timeIn: row.id !== 'add' ? returnTimeStr(row.timeIn) : '',
      timeOut: row.id !== 'add' ? returnTimeStr(row.timeOut) : '',
      hours: row.id !== 'add' ? calculateHours(row.timeIn, row.timeOut) : '',
      status: row.id !== 'add' ? row.status : '',
    }));
  };

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
      renderCell: (params) => {
        if (params.id === 'add') {
          return (
            <Button
              onClick={openAdd}
              sx={{
                backgroundColor: '#800000',
                color: 'white',
                padding: 1,
                minWidth: 'auto',
                width: 36,
                height: 36,
                '&:hover': {
                  backgroundColor: '#470000',
                },
              }}
            >
              <AddIcon />
            </Button>
          );
        }
        return (
          <Button
            onClick={() => handleDeleteRow(params.id)}
            sx={{
              backgroundColor: '#800000',
              color: 'white',
              fontWeight: 'bold',
              padding: 1,
              minWidth: 'auto',
              width: 36,
              height: 36,
              '&:hover': {
                backgroundColor: '#470000',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        );
      },
    },
  ];

  const handleDeleteRow = (id) => {
    setRows((prevRows) => {
      const rowIndex = prevRows.findIndex((row) => row.id === id);
      if (rowIndex > -1) {
        prevRows.splice(rowIndex, 1); // Remove the element from the array
      }
      return [...prevRows]; // Return a new array to trigger a state update
    });
  };

  const handleAddRow = (date, timeIn, timeOut) => {
    let dateIn = new Date(date);
    let dateOut = new Date(date);
    dateIn.setHours(timeIn.getHours());
    dateIn.setMinutes(timeIn.getMinutes());
    dateOut.setHours(timeOut.getHours());
    dateOut.setMinutes(timeOut.getMinutes());
    setRows((prevRows) => [...prevRows, { id: prevRows.length, timeIn: dateIn, timeOut: dateOut, status: '' }])
  };

  const totalHours = rows
    .filter((row) => row.id !== 'add')
    .reduce((total, row) => total + calculateHours(row.timeIn, row.timeOut), 0);

  // Validation for the Add button: date, timeIn, and timeOut must be valid
  const isAddDisabled = !date || !timeIn || !timeOut || timeOut <= timeIn || dateError || timeInError || timeOutError;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '2vh 0vh',
        overflowY: 'auto',
      }}
    >
      <Card
        sx={{
          width: 600,
          backgroundColor: '#ffffff',
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            backgroundColor: '#800000',
            color: '#ffffff',
            p: 1,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Timesheet
          </Typography>
        </Box>
        <CardContent>
          <DataGrid
            rows={[...displayRows(rows), { id: 'add' }]}
            columns={columns}
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
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: 'gray',
                '&:hover': {
                  backgroundColor: '#646464',
                },
              }}
            >
              Save
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Dialog open={addOpened} onClose={closeAdd}>
        <DialogTitle sx={{ backgroundColor: '#800000', color: 'white' }}>Add Entry</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              disableFuture
              label="Select Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              onError={(error) => handleDateError(error)}
              sx={{ marginTop: 2 }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  helperText: dateErrorMessage,
                },
              }}
            />
            <TimePicker
              label="Time In"
              value={timeIn}
              onChange={(newValue) => setTimeIn(newValue)}
              minutesStep={15}
              onError={(newError) => handleTimeInError(newError)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  helperText: timeInErrorMessage,
                },
              }}
            />
            <TimePicker
              label="Time Out"
              value={timeOut}
              onChange={(newValue) => setTimeOut(newValue)}
              minutesStep={15}
              onError={(newError) => handleTimeOutError(newError)}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  helperText: timeOutErrorMessage,
                },
              }}
            />
            {timeOutBefore && (
              <Typography sx={{ color: 'red', fontSize: '.8rem'}}>
                Time Out is before Time in
              </Typography>
            )}
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdd}>Close</Button>
          <Button
            onClick={() => {
              handleAddRow(date, timeIn, timeOut);
              setDate(null);
              setTimeIn(null);
              setTimeOut(null);
              closeAdd();
            }}
            disabled={isAddDisabled}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employment;
