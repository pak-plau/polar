import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, CardHeader, } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Schedule from './Schedule';

const Registration = () => {
  const [cartRows, setCartRows] = useState([
    { id: 1, class: 'CSE 316 - 01', time: 'TuTh 11:00AM-12:20PM', room: 'JLC 102', instructor: 'C. Kane', credits: 3.0 },
    { id: 2, class: 'CSE 320 - 01', time: 'TuTh 5:30PM-6:50PM', room: 'JLC 110', instructor: 'H. Stark', credits: 3.0 },
    { id: 3, class: 'CSE 385 - 01', time: 'MoWe 2:30PM-3:50PM', room: 'NCS 220', instructor: 'M. Bender', credits: 3.0 },
  ]);

  const graduationRows = [
    { id: 1, requirement: 'SBU 101', title: 'Intro to Stony Brook', grade: 'S', credits: 1, term: 'Fall 2021' },
    { id: 2, requirement: 'HIS GLO/AP', title: 'World History', grade: 'T', credits: 3, term: 'Fall 2021' },
  ];

  const cartColumns = [
    { field: 'class', headerName: 'Class', flex: 1.25 },
    { field: 'time', headerName: 'Days/Times', flex: 2 },
    { field: 'room', headerName: 'Room', flex: 1 },
    { field: 'instructor', headerName: 'Instructor', flex: 1 },
    { field: 'credits', headerName: 'Credits', flex: .75, align: 'center', headerAlign: 'center' },
    {
      field: 'delete',
      headerName: '',
      flex: .65,
      renderCell: (params) => {
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

  const graduationColumns = [
    { field: 'requirement', headerName: 'Requirement', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'grade', headerName: 'Grade', flex: 0.5 },
    { field: 'credits', headerName: 'Credits', flex: 0.5 },
    { field: 'term', headerName: 'Term', flex: 0.5 },
  ];

  const handleDeleteRow = (id) => {
    setCartRows((prevRows) => {
      return prevRows.filter((row) => row.id !== id);
    });
  }

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'row',
        p: 2,
        gap: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card 
        sx={{
          width: '33vw',
        }}
      >
        <CardHeader
          title="Cart"
          sx={{ backgroundColor: '#800000', color: '#fff', p: 1 }}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 1,
            gap: 2,
          }}
        >
          <DataGrid
            rows={cartRows}
            columns={cartColumns}
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
          <Button
            onClick={() => console.log(cartRows)}
            variant="contained"
            sx={{ backgroundColor: '#ddd', color: '#000', width: '100%' }}
          >
            Proceed
          </Button>
          <Schedule />
        </CardContent>
      </Card>
      <Card 
        sx={{
          width: '33vw',
        }}
      >
        <CardHeader
          title="Class Information"
          sx={{ backgroundColor: '#800000', color: '#fff', p: 1 }}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <TextField
            label="Search Classes"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            CSE 300-01: Technical Communications
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Principles of professional technical communications for Computer
            Science majors. Includes business communications, user manuals,
            press releases, and presentation techniques.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Student Comments:</strong> Amazing class, loved the
            projects. Highly recommend!
          </Typography>
        </CardContent>
      </Card>
      <Card 
        sx={{
          width: '33vw'
        }}
      >
        <CardHeader
          title="Graduation Requirements"
          sx={{ backgroundColor: '#800000', color: '#fff', p: 1 }}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Typography variant="body1">
            Degree in <strong>Bachelor of Science</strong> | Overall GPA:{' '}
            <strong>4.0</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Credits Required: 120 | Credits Applied: 119
          </Typography>
          <Box sx={{ height: 300 }}>
            <DataGrid
              rows={graduationRows}
              columns={graduationColumns}
              pageSize={5}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Registration;
