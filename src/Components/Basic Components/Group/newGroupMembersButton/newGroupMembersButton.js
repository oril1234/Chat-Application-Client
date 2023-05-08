import { Avatar, Box, Typography, Badge } from "@mui/material";
import React, { useEffect, useState } from "react";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

/**
 * A button that when clicked triggers a pop up for adding new 
 * members to group
 * @param {*} setNewMembersMode - A function that with the argument of
 * true triggers the pop up
 */
export default function NewGroupMembersButton({setNewMembersMode}) {
    const [isOnHover, setOnHover] = useState(false)
    useEffect(() => {
    }, [])
    return (
        <Box
            display="flex"
            alignItems="center"
            onClick={() => {setNewMembersMode(true) }}
            onMouseEnter={() => {setOnHover(true) }}
            onMouseLeave={() => {setOnHover(false) }}
            sx={{
                background:  isOnHover ? "#2b3943" : "#101b20",
                padding: "8px 12px",
                cursor: "pointer"
            }}
        >
            <Avatar style={{ backgroundColor: '#1bbd7e', color: "white" }}><PersonAddIcon /></Avatar>
            <Box
                display="flex"
                flexDirection="column"
                pl="15px"
                width="100%"
                alignItems="flex-start"
            >
                <Box display="flex" justifyContent="start" width="100%">

                    <Typography variant="body1" color="#d1d7db">
                        Add New Members
                    </Typography>

                </Box>

            </Box>
            
        </Box>
    );
}
