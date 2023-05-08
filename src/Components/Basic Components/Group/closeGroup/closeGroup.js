import { Avatar, Box, Typography } from "@mui/material";
import React, { useState } from "react";
import LogoutIcon from '@mui/icons-material/Logout';

/**
 * Button that when clicked a confirmation pop up for closing a group by 
 * its admin displays
 * @param {*} setCloseGroupMode - A function to trigger a confirmation
 * pop up for closing a group to display
 */
export default function CloseGroupButton({setCloseGroupMode}) {

    //True when cursor is above the component
    const [isOnHover, setOnHover] = useState(false)
    return (
        <Box
            display="flex"
            alignItems="center"
            onClick={() => {setCloseGroupMode(true) }}
            onMouseEnter={() => {setOnHover(true) }}
            onMouseLeave={() => {setOnHover(false) }}
            sx={{
                background:  isOnHover ? "#2b3943" : "#101b20",
                padding: "8px 12px",
                cursor: "pointer",
                marginTop:"3%"
            }}
        >
            <Avatar style={{ backgroundColor: '#E10606', color: "white" }}><LogoutIcon /></Avatar>
            <Box
                display="flex"
                flexDirection="column"
                pl="15px"
                width="100%"
                alignItems="flex-start"
            >
                <Box display="flex" justifyContent="start" width="100%">

                    <Typography variant="body1" color="#E10606">
                        Close Group
                    </Typography>

                </Box>

            </Box>
        </Box>
    );
}
