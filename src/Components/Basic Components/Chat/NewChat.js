import { Avatar, Box, Input, Typography } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from "react";
import generalSVR from "../../../API services/general_service"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatCard from "./ChatCard";


/**
 * A section displayed whenever the logged in user wishes to start
 * a new chat
 * @param {*} setNewChatMode - When triggered with the argument of 
 * false this component disappears
 */
export default function NewChat({ setNewChatMode }) {

  /*
  Channels of users the current user has not exchanged messages with yet
  */
  const uncommunicatedChannels = useSelector(
    state => state.uncommunicatedChannelsReducer).channels

  /*
  All the current user's group and private chats with which at least one
  message was sent
  */
  const channels = useSelector(state => state.channelsReducer).channels

  /*
  Hook to dispatch action to redux reducer
  */
  const dispatch = useDispatch()

  //The input the user types in order to find a specific contact
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {

    //A function to load all uncommunicated channels
    const getUncommunicatedChannelsDataFromDB = async () => {
      let response = await generalSVR.getUncommunicatedContactsData()
      let uncommunicatedContactsData = response.data.data

      //Updating reducer with data of uncommunicated channels
      dispatch({
        type: "UPDATE_UNCOMMUNICATED_CHANNELS",
        payload: uncommunicatedContactsData
      })

    }

    if (uncommunicatedChannels.length === 0)
      getUncommunicatedChannelsDataFromDB()

  }, [])

  return (
    <Box
      mxaxHeight="100%"
      width="30%"

      pt={3}
    >
      <Box
        sx={{
          background: "#101b20",
          padding: "12px",
        }}

      >
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
        >
          {/**
           When clicked app returns to previous screen
            */
            <Avatar
              style={{
                cursor: 'pointer',
                color: 'white', background: 'transparent',
                fontWeight: 'bold', marginRight: '10%'
              }}
              onClick={() => {
                setNewChatMode(false)

              }}>
              <ArrowBackIcon />
            </Avatar>}
          <Typography>
            New Chat
          </Typography>

        </Box>


        {
          //Input firld to enter the search wuery to find the desired chat
          <Input
            fullWidth
            disableUnderline
            placeholder="Type contact name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              height: "35px",
              color: "white",
              padding: "0px 13px",
              fontSize: "14px",
            }}

          />}

      </Box>
      <Box
        overflow="auto"
        height="40%"
        sx={{
          background: "#101b20",
        }}
      >
        {[...channels, ...uncommunicatedChannels]
          .filter(ch => {

            /*
            Function to filter chats according to search query entered
            as an input
            */
            const checkStartsWith = (full_string) => 
            {
              let strArr =
                full_string.replace(/\s+/g, ' ').trim().split(" ")
              for (let i = 0; i < strArr.length; i++)
                if (strArr[i].toLowerCase().startsWith(
                  searchQuery.toLowerCase()))
                  return true
              return false
            }
            if ("group_id" in ch)
              return checkStartsWith(ch["group_name"])

            return checkStartsWith(ch["partner"]["username"])

          })
          .map((channel) => {
            return (
              <ChatCard
                key={"chat_id" in channel ?
                  channel["chat_id"] : channel["group_id"]}
                channel={channel}
                isChildOfNewChatComponent={true}
                setNewChatMode={setNewChatMode}
              />)
          })

        }
        <Box pt="50px" />

      </Box>


    </Box>
  );
}
