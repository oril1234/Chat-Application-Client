import { Avatar, Box, Typography} from "@mui/material";
import React, {useState } from "react";
import {useSelector } from "react-redux";
import utils_functions from "../../../../utils/utils_functions";

/**
 * Component of a card used to display a group that is shared by 2 users
 * who chat with each other
 * @param {*} group - The group that is being shared
 */
export default function SharedGroupCard({ group }) {

  //True when curson is above component
  const [isOnHover, setOnHover] = useState(false)

  //Channels (private and group chats) of logged in user
  const channels = useSelector(state => state.channelsReducer).channels

  /*
  Private chat with users with whom the logged in user still did not
  exchange messages
  */
  const uncommunicatedChannels = useSelector(state =>
     state.uncommunicatedChannelsReducer).channels

  //ID and index of the channel the user selected
  const selectedChannel = useSelector(state =>
    state.selectedChannelReducer).selectedChannel

  //The channel the user selected
  const channel = channels[selectedChannel.index]

  //Function to select current group to open its chat window
  const handleSelectSharedGroup = () => {
    utils_functions.selectChannel(channels,uncommunicatedChannels,channel,
      group["group_id"])

  }

  return (
    <Box
      display="flex"
      alignItems="center"
      onClick={() => handleSelectSharedGroup()}
      onMouseEnter={() => { setOnHover(true) }}
      onMouseLeave={() => { setOnHover(false) }}
      sx={{
        background: isOnHover ? "#2b3943" : "#101b20",
        padding: "8px 12px",
        cursor: "pointer"
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        pl="15px"
        width="100%"
        alignItems="flex-start"
      >

        <Box display="flex" alignItems="center" justifyContent="start" width="100%">
          <Avatar />
          <Typography variant="body1" color="#d1d7db">
            {group["name"]}
          </Typography>

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
