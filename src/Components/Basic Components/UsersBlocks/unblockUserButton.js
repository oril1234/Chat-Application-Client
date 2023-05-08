import { Avatar, Box, Typography} from "@mui/material";
import React, {useState } from "react";
import BlockIcon from '@mui/icons-material/Block';

/**
 * Button that when clicked a confirmation pop up to unblock a user by
 * the logged in user displays
 * @param {*} setUnblockUserMode - A function that when triggered the pop
 * up displays
 */
export default function UnblockUserButton({setUnblockUserMode}) {
    const [isOnHover, setOnHover] = useState(false)
    return (
        <Box
            display="flex"
            alignItems="center"
            onClick={() => {setUnblockUserMode(true) }}
            onMouseEnter={() => {setOnHover(true) }}
            onMouseLeave={() => {setOnHover(false) }}
            sx={{
                background:  isOnHover ? "#2b3943" : "#101b20",
                padding: "8px 12px",
                cursor: "pointer",
                marginTop:"3%"
            }}
        >
            <Avatar style={{ backgroundColor: 'green', color: "white" }}><BlockIcon /></Avatar>
            <Box
                display="flex"
                flexDirection="column"
                pl="15px"
                width="100%"
                alignItems="flex-start"
            >
                <Box display="flex" justifyContent="start" width="100%">

                    <Typography variant="body1" color="green">
                      Unblock User
                    </Typography>

                </Box>

            </Box>
        </Box>
    );
}
