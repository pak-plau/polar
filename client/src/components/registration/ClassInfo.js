import { Box, Typography } from '@mui/material';
import React from 'react';

const ClassInfo = ({ class1, code, title, description, prereq, sbc }) => {
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" >
                {class1} {code}: {title}
            </Typography>
            <Typography variant="body2">
                {description}
            </Typography>
            <Typography variant="body2">
                <strong>Prerequisites: </strong>{prereq}
            </Typography>
            <Typography variant="body2">
                <strong>SBC: </strong>{sbc.join(", ")}
            </Typography>
        </Box>
    )
}

export default ClassInfo