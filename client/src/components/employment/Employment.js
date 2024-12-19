import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Typography, Card, Box, CardContent, Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const Employment = () => {
  const [rows, setRows] = useState([]);
  const [addOpened, setAddOpened] = useState(false);
  const [date, setDate] = useState(null);
  const [timeIn, setTimeIn] = useState(null);
  const [timeOut, setTimeOut] = useState(null);
  const [dateError, setDateError] = useState(false);
  const [timeInError, setTimeInError] = useState(false);
  const [timeOutError, setTimeOutError] = useState(false);
  const [timeOutBefore, setTimeOutBefore] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  useEffect(() => {
    const fetchTimesheetData = async () => {
      try {
        const response = await fetch("http://localhost:8080/getTimesheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: "114640750" }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch timesheet data");
        }
        const data = await response.json();
        if (data != null) {
          const formattedRows = data.map((entry, index) => ({
            id: index,
            status: entry.status,
            timeIn: new Date(entry.timeIn),
            timeOut: new Date(entry.timeOut),
          }));
          setRows(formattedRows);
        } else {
          setRows([]);
        }
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      }
    };
    fetchTimesheetData();
  }, []);

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
  };

  const handleTimeInError = (error) => {
    setTimeInError(error);
  };

  const handleTimeOutError = (error) => {
    setTimeOutError(error);
  };

  const validateTimeOut = (timeIn, timeOut) => {
    setTimeOutBefore(timeIn && timeOut && timeOut <= timeIn);
  };

  useEffect(() => {
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

  const getTimeInMinutes = (time) => {
    if (!time) {
      return 0;
    }
    return time.getHours() * 60 + time.getMinutes();
  }

  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const conflict = () => {
    return rows.some((row) => {
      return (
        date && timeIn && timeOut && row.timeIn && row.timeOut && isSameDate(date, row.timeIn) &&
        (
          (getTimeInMinutes(timeIn) >= getTimeInMinutes(row.timeIn) && getTimeInMinutes(timeOut) <= getTimeInMinutes(row.timeOut)) 
          ||
          (getTimeInMinutes(timeIn) < getTimeInMinutes(row.timeIn) && getTimeInMinutes(timeOut) > getTimeInMinutes(row.timeIn) && getTimeInMinutes(timeOut) <= getTimeInMinutes(row.timeOut))
          ||
          (getTimeInMinutes(timeIn) >= getTimeInMinutes(row.timeIn) && getTimeInMinutes(timeIn) < getTimeInMinutes(row.timeOut) && getTimeInMinutes(timeOut) >= getTimeInMinutes(row.timeOut))
          ||
          (getTimeInMinutes(timeIn) <= getTimeInMinutes(row.timeIn) && getTimeInMinutes(timeOut) >= getTimeInMinutes(row.timeOut))
        )
      );
    });
  };

  const returnTimeStr = (dateTime) => {
    let hours = dateTime.getHours();
    let minutes = dateTime.getMinutes();
    let suffix = hours < 12 ? 'AM' : 'PM';
    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}${suffix}`;
  };

  const displayRows = (rows) => {
    if (rows.length === 0) {
      return [];
    }
    return rows.map((row) => ({
      id: row.id,
      date: row.id !== 'add' ? `${row.timeIn.getMonth() + 1}/${row.timeIn.getDate()}/${row.timeIn.getFullYear()}` : '',
      timeIn: row.id !== 'add' ? returnTimeStr(row.timeIn) : '',
      timeOut: row.id !== 'add' ? returnTimeStr(row.timeOut) : '',
      hours: row.id !== 'add' ? calculateHours(row.timeIn, row.timeOut) : '',
      status: row.id !== 'add' ? row.status : '',
    }));
  };

  const handleDeleteRow = (id) => {
    const rowToDelete = rows.find((row) => row.id === id);
    if (rowToDelete && rowToDelete.status === 'A') {
      setRowToDelete(rowToDelete);
      setOpenDeleteDialog(true);
    } else {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    }
  };  

  const handleAddRow = (date, timeIn, timeOut) => {
    let dateIn = new Date(date);
    let dateOut = new Date(date);
    dateIn.setHours(timeIn.getHours());
    dateIn.setMinutes(timeIn.getMinutes());
    dateOut.setHours(timeOut.getHours());
    dateOut.setMinutes(timeOut.getMinutes());
    setRows((prevRows) => [...prevRows, { id: prevRows.length, timeIn: dateIn, timeOut: dateOut, status: '' }]);
  };

  const handleSave = () => {
    const timesheetData = rows
      .filter((row) => row.id !== 'add')
      .map(({ id, delete: _, ...rest }) => rest);
    fetch('http://localhost:8080/saveTimesheet', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timesheet: timesheetData, id:"114640750" }),
    }).then((response) => {
      if (response.ok) {
        console.log('Timesheet saved successfully');
      } else {
        console.error('Failed to save timesheet');
      }
    }).catch((error) => {
      console.error('Error:', error);
    });
  };
  

  const totalHours = rows
    .filter((row) => row.id !== 'add')
    .reduce((total, row) => total + calculateHours(row.timeIn, row.timeOut), 0);

  const isAddDisabled = !date || !timeIn || !timeOut || timeOut <= timeIn || dateError || timeInError || timeOutError || calculateHours(timeIn, timeOut) > 6 || conflict();

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
            columns={[
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
                      <DeleteIcon />
                    </Button>
                  );
                },
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2,
              mt: 2,
              width: '100%',
            }}
          >
            <Typography variant="body1">
              Total Hours: {totalHours.toFixed(2)}
            </Typography>
            <Button
              onClick={handleSave}
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
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ backgroundColor: '#800000', color: 'white' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Typography>
            You cannot delete rows that have been approved
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              backgroundColor: 'gray',
              color: 'white',
              '&:hover': {
                backgroundColor: '#646464',
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
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
              sx={{ mt: 2 }}
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
            {calculateHours(timeIn, timeOut) > 6 && (
              <Typography sx={{ color: 'red', fontSize: '.8rem'}}>
                Time is greater than 6 hours
              </Typography>
            )}
            {conflict() && (
              <Typography sx={{ color: 'red', fontSize: '.8rem'}}>
                There is a time conflict
              </Typography>
            )}
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeAdd}
            sx={{
              backgroundColor: 'gray',
              color: 'white',
              '&:hover': {
                backgroundColor: '#646464',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleAddRow(date, timeIn, timeOut);
              setDate(null);
              setTimeIn(null);
              setTimeOut(null);
              closeAdd();
            }}
            disabled={isAddDisabled}
            sx={{
              backgroundColor: isAddDisabled ? 'white' : '#800000',
              color: 'white',
              '&:hover': {
                backgroundColor: '#470000',
              },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employment;
