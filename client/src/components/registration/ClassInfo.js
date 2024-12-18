import { Box, Typography } from '@mui/material';
import React from 'react';

const ClassInfo = ({ class1, code, title, description, prereq, sbc }) => {

    const formatPrereq = () => {
        let str = [];
        prereq.split(";").forEach((req) => {
            if (req.startsWith("major")) {
                str.push(req.substring(6).split("/").join(" or ") + " major");
            } else if (req.startsWith(">")) {
                let temp = req.split(" ");
                str.push(temp[0].substring(1) + " or higher in " + temp[1].split("/").map((item) => item.replace(',', ' ')).join(" or "));
            } else if (req.startsWith("standing")) {
                str.push(req.substring(9) + " or higher standing");
            } else {
                str.push(req.split("/").map((item) => item.replace(',', ' ')).join(" or "));
            }
        });
        return str.join("; ");
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" >
                {class1} {code}: {title}
            </Typography>
            <Typography variant="body2">
                {description}
            </Typography>
            {prereq &&
                <Typography variant="body2">
                    <strong>Prerequisites: </strong>{formatPrereq()}
                </Typography>
            }
            {sbc[0] != "" > 0 &&
                <Typography variant="body2">
                    <strong>SBC: </strong>{sbc.join(", ")}
                </Typography>
            }
        </Box>
    )
}

export default ClassInfo