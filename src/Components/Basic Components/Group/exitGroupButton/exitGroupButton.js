import { Avatar, Box, Typography} from "@mui/material";
import React, { useEffect, useState } from "react";
import LogoutIcon from '@mui/icons-material/Logout';

/**
 * A button that when clicked triggers a pop up for adding new 
 * members to group
 * @param {*} setExitGroupMode - A function that with the argument of
 * true triggers the pop up
 */
export default function ExitGroupButton({setExitGroupMode}) {
    const [isOnHover, setOnHover] = useState(false)
    useEffect(() => {
    }, [])
    return (
        <Box
            display="flex"
            alignItems="center"
            onClick={() => {setExitGroupMode(true) }}
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
                        Exit Group
                    </Typography>

                </Box>

            </Box>
        </Box>
    );
}
