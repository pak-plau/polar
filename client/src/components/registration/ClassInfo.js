import { Box, Typography } from '@mui/material';
import React from 'react';

const ClassInfo = () => {
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" >
                CSE 300-01: Technical Communications
            </Typography>
            <Typography variant="body2">
                Principles of professional technical communications for Computer
                Science majors. Includes business communications, user manuals,
                press releases, and presentation techniques.
            </Typography>
            <Typography variant="body2">
                <strong>Prerequisites: </strong>WRT 102; CSE or ISE or DAS major, U3 or U4 standing
            </Typography>
            <Typography variant="body2">
                <strong>SBC: </strong>SPK, WRTD
            </Typography>
        </Box>
    )
}

export default ClassInfo