import { Avatar, Box, Typography} from "@mui/material";
import React, { useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';

/**
 * Component of a button to delete a channel ( private chat or a group chat)
 * @param {*} setDeleteChannelMode - When triggered with the argument of
 * true a confirmation pop up for deleting a channel displays
 * @param {*} isGroup - True if the channel to be deleted is a group chat
 */
export default function DeleteChannelButton({setDeleteChannelMode,isGroup}) {

    //True when cursor is above the component
    const [isOnHover, setOnHover] = useState(false)
    return (
        <Box
            display="flex"
            alignItems="center"
            onClick={() => {setDeleteChannelMode(true) }}
            onMouseEnter={() => {setOnHover(true) }}
            onMouseLeave={() => {setOnHover(false) }}
            sx={{
                background:  isOnHover ? "#2b3943" : "#101b20",
                padding: "8px 12px",
                cursor: "pointer",
                marginTop:"3%"
            }}
        >
            <Avatar style={{ backgroundColor: '#E10606', color: "white" }}>
                <ClearIcon /></Avatar>
            <Box
                display="flex"
                flexDirection="column"
                pl="15px"
                width="100%"
                alignItems="flex-start"
            >
                <Box display="flex" justifyContent="start" width="100%">

                    <Typography variant="body1" color="#E10606">
                       {isGroup?"Delete Group":"Delete Chat"}
                    </Typography>

                </Box>

            </Box>
        </Box>
    );
}
