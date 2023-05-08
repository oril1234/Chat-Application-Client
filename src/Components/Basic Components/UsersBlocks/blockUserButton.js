import { Avatar, Box, Typography } from "@mui/material";
import React, { useState } from "react";
import BlockIcon from '@mui/icons-material/Block';

/**
 * Button that when clicked a confirmation pop up to block a user by
 * the logged in user displays
 * @param {*} setBlockUserMode - A function that when triggered the pop
 * up displays
 */
export default function BlockUserButton({setBlockUserMode}) {

    //True when cursor is above the component
    const [isOnHover, setOnHover] = useState(false)
    return (
        <Box
            display="flex"
            alignItems="center"
            onClick={() => {setBlockUserMode(true) }}
            onMouseEnter={() => {setOnHover(true) }}
            onMouseLeave={() => {setOnHover(false) }}
            sx={{
                background:  isOnHover ? "#2b3943" : "#101b20",
                padding: "8px 12px",
                cursor: "pointer",
                marginTop:"3%"
            }}
        >
            <Avatar style={{ backgroundColor: '#E10606', color: "white" }}><BlockIcon /></Avatar>
            <Box
                display="flex"
                flexDirection="column"
                pl="15px"
                width="100%"
                alignItems="flex-start"
            >
                <Box display="flex" justifyContent="start" width="100%">

                    <Typography variant="body1" color="#E10606">
                      Block User
                    </Typography>

                </Box>

            </Box>
        </Box>
    );
}
