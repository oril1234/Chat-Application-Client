import { Avatar, Box, Typography } from "@mui/material";
import React from "react";


/**
 * Component to display a user that can be selected by an admin
 * of a group to be added to a the group
 * @param {*} contact - contact the logged in user can select to add
 * to a group
 * @param {*} handleSelectContat - A function triggered after the contact
 * was selected in otder to inform the parent component 
 */
export default function ContactToAddToGroup({ contact,
  handleSelectContact }) {

  return (
    <Box
      display="flex"
      onClick={()=>{handleSelectContact(contact)}}
      sx={{
        background: "#101b20",
        padding: "8px 12px",
        cursor:"pointer"
      }}
    >
      <Avatar />
      <Box
        display="flex"
        flexDirection="column"
        pl="15px"
        width="100%"
        alignItems="flex-start"
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          <Typography variant="body1" color="#d1d7db">
            {contact["username"]}
          </Typography>

        </Box>
        <Box display="flex" justifyContent="space-between"
         alignItems={'center'} width="100%"
        
          >

        </Box>


        <Box
          width="100%"
          mt="13px"
          sx={{
            border: ".05px solid #2f3b44",
          }}
        />
      </Box>
    </Box>
  );
}
