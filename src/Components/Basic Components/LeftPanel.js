import { Avatar, Box, IconButton, Input } from "@mui/material";
import CustomAppBar from "./CustomAppBar/CustomAppBar";
import ChatIcon from "@mui/icons-material/Chat";
import ChatCard from "./Chat/ChatCard";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from "react";
import LeftPanelMenuButton from "./CustomMenuButton/LeftPanelMenuButton";
import generalSVR from "../../API services/general_service";

/**
 * Left panel of the application in which all the channels of the users 
 * are displayed in cards for him to select
 * @param {*} channels - All the user's channels (private and group chats )
 * @param {*} setNewGroupMode - Function to to display new group component when
 * triggered with argument of true
 * @param {*} setNewChatMode - Function to to display new chat component when
 * triggered with argument of true
 * @param {*} disconnect - A function to disconnect the logged in user from the
 * application
 */
export default function LeftPanel({ channels, setNewGroupMode,
  setNewChatMode, disconnect }) {

  /*
  Private chats of users the logged in user has not exchanged messages with yet
  */
  const uncommunicatedChannels = useSelector(
    state => state.uncommunicatedChannelsReducer).channels

  /*
  The search query the user types as an input in the input field above all the
  chats cards in order to filter out the the private chats in which the chats
  partners' names don't start with that query, as with groups their names
  don't start with the query 
  */
  const [searchQuery, setSearchQuery] = useState("")

  //When true only channels with unread messages are displayed
  const [unreadMessagesFilterOn, setUnreadMessagesFilterOn] = useState(false)

  /*
    Variable to store the ID of a channel that previously passed the
    filter of channels with unread messages, done using the
    variable unreadMessagesFilterOn and afterwards because
    of being selected, it does not contain unread messages anymore 
  */
  const [filteredChannelAfterSelectCard,
    setFilteredChannelAfterSelectCard] = useState("")

  //Hook to update redux reducer
  const dispatch = useDispatch()

  const inputRef = useRef(null)
  const [isInputFocused, setInputFocused] = useState(false)

  /**
   * Function used to sort the displayed list of channels
   * @param {*} ch1 - A channal
   * @param {*} ch2 - Another channel to compare to the firstc channel in order to 
   * determine which one of them precedes the other
   */
  const sortChannels = (ch1, ch2) => {

    /*
    The next 2 variables have the value of true if ch1 or ch2 are
    communicated channels, meaning they are groups or chats in which at least
    1 message has been sent
    */
    let ch1_com = ch1["channel_messages"].length > 0 || (
      "group_id" in ch1 && ch1["channel_messages"].length === 0
    )
    let ch2_com = ch2["channel_messages"].length > 0 || (
      "group_id" in ch2 && ch2["channel_messages"].length === 0
    )

    //Executed if ch1 is not a communicated channel and ch2 is
    if (!ch1_com && ch2_com)
      return 1

    //Executed if ch2 is not a communicated channel and ch1 is
    if (!ch2_com && ch1_com)
      return -1

    //Comparing the last activity of the channels if they're both communicated
    return new Date(ch2["last_activity"]) - new Date(ch1["last_activity"])
  }

  useEffect(() => {
    /*
    Executed if the unread messages filter has just been turned of
    and the variable filteredChannelAfterSelectCard is storing id of
    a chat that previously had unread messages, and after its selection by the user
    those messages were read. The id was stored in the varible in order to
    prevent its filtering out because of lacking unread messages
    */
    if (!unreadMessagesFilterOn && filteredChannelAfterSelectCard !== "")
      setFilteredChannelAfterSelectCard("")
  }, [unreadMessagesFilterOn])


  useEffect(() => {

    /*
    Function to fetch user's uncommunicated channels - private chats in which
    with the user's contacts he did not exchange messages wit them
    */
    const getUncommunicatedcontactsDataFromDB = async () => {
      let response = await generalSVR.getUncommunicatedContactsData()
      let uncommunicatedContactsData = response.data.data

      //Updating redux reducer with uncommunicated channels
      dispatch({
        type: "UPDATE_UNCOMMUNICATED_CHANNELS",
        payload: uncommunicatedContactsData
      })

    }

    //Executed if uncommunicated channels haven't already been fetched
    if (uncommunicatedChannels.length === 0)
      getUncommunicatedcontactsDataFromDB()

  }, [])



  return (
    <Box
      height="100%"
      width="30%"
      overflow="hidden"
    >
      {
        //App bar of left panel
        <CustomAppBar>
          <Box
            width="100%"
            height="100%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Avatar />
            <Box display="flex">
              {
                //Button that when clicked opens new chat section
                <IconButton
                  onClick={() => { setNewChatMode(true) }}
                  sx={{
                    paddingRight: "10px",
                  }}
                >
                  <ChatIcon
                    sx={{
                      color: "#afbac0",
                    }}
                  />
                </IconButton>}


              {
                /*
                Dropdown menu with 2 options:
                1. log out from the application
                2. opening new group section
                */
                <LeftPanelMenuButton setNewGroupMode={setNewGroupMode}
                  disconnect={disconnect}
                  menuItems={["New Group","Logout"]} />}
            </Box>
          </Box>
        </CustomAppBar>}
      <Box
        sx={{
          background: "#101b20",
          padding: "12px",
        }}
        display="flex"
      >
        <Box
          display="flex"
          sx={{
            background: "#1f2c33",
            borderRadius: "8px",
            padding: "0px 8px",
            height: '30px'
          }}
          flex={1}
          alignItems="center"
        >
          {
            //Icon to toggle between focused and blured mode of the search input
            <IconButton onClick={() => {
              if (inputRef && inputRef.current) {

                if (!isInputFocused) {
                  setInputFocused(true)
                  inputRef.current.focus()
                }
                else {
                  setInputFocused(false)
                  inputRef.current.blur()
                }
              }


            }}>
              {
                //Icon displayed when search input is not focused
                !isInputFocused ?
                  <SearchIcon
                    sx={{
                      color: "#8696a1",
                      height: "20px",
                      width: "20px",
                    }}
                  /> :
                  //Icon displayed when search input is focused
                  <ArrowBackIcon
                    sx={{
                      color: "#8696a1",
                      height: "20px",
                      width: "20px",
                    }}
                  />
              }

            </IconButton>
          }

          {
            /*
            Search input to in order to filter the list of user's channels according
            to search query typed by the user
            */
            <Input
              fullWidth
              disableUnderline
              value={searchQuery}
              inputRef={inputRef}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start a new chat"
              sx={{
                height: "30px",
                color: "white",
                padding: "0px 13px",
                fontSize: "14px"
              }}
            />}
        </Box>
        {
          /*
          Button to turn on and of the unread messages filter. When this filter is
          on, only channels with unread messages are displayed
          */
          <IconButton
            sx={{
              background: unreadMessagesFilterOn ?
                "#00a884" : "",
              height: "25px",
              width: "25px",
              "&:hover": {
                backgroundColor: unreadMessagesFilterOn ?
                  "#00a884" : ""
              }
            }}
            onClick={() => setUnreadMessagesFilterOn(!unreadMessagesFilterOn)}>
            <FilterListIcon
              sx={{
                color: "white",
                height: "20px",
                width: "20px"

              }}
            />
          </IconButton>}
      </Box>
      <Box
        overflow="auto"
        height="90%"
        sx={{
          background: "#101b20",
        }}
      >
        {
          //List of channels displayed as long as the user did not enter an input
          (searchQuery === "" && channels !== undefined) ?
            [...channels].filter(ch => {
              let channel_id = "chat_id" in ch ? ch["chat_id"] : ch["group_id"]
              
              /*
              Filtering out current channel if unread messages filter is on,
              it has no unread messages, and did not have ones before.
              filteredChannelAfterSelectCard would have been equal to channel id
              only if this channel was the last one to be selected by the user
              and it had unread messages before its selection
              */
              if (unreadMessagesFilterOn && (
                ch["unread_messages_number"] === 0
                && filteredChannelAfterSelectCard !== channel_id))
                return false

              return true
            })
              .sort((ch1, ch2) => {
                return sortChannels(ch1, ch2)
              })
              .map((channel) => {
                return (
                  //Chat card to display part of the details of the channel
                  <ChatCard
                    unreadMessagesFilterOn={unreadMessagesFilterOn}
                    setFilteredChannelAfterSelectCard={
                      setFilteredChannelAfterSelectCard
                    }
                    key={"chat_id" in channel ?
                      channel["chat_id"] : channel["group_id"]}
                    channel={channel}
                  />)
              }) :

            //List of all of the use's channels, including chats with no messages 
            [...channels, ...uncommunicatedChannels]
              .filter(ch => {

                /*
                Filterring out this channel if unread messages is on and 
                the channel has no unread messages
                */
                if (unreadMessagesFilterOn &&
                  ch["unread_messages_number"] === 0)
                  return false

                /*
                This function assures the list of channels only displays
                channels in which for each of them at least one of the words in the name
                of the chat partner or group name starts with search query the user
                enters
                */
                const checkStartsWith = (full_string) => {
                  let strArr =
                    full_string.replace(/\s+/g, ' ').trim().split(" ")
                  for (let i = 0; i < strArr.length; i++)
                    if (strArr[i].toLowerCase()
                      .startsWith(searchQuery.toLowerCase()))
                      return true
                  return false
                }

                if ("group_id" in ch)
                  return checkStartsWith(ch["group_name"])

                return checkStartsWith(ch["partner"]["username"])

              })
              .sort((ch1, ch2) => {
                return sortChannels(ch1, ch2)
              })
              .map((channel) => {
                return (
                  //Chat card to display part of the details of the channel
                  <ChatCard
                    key={"chat_id" in channel ?
                      channel["chat_id"] : channel["group_id"]}
                    channel={channel}
                  />)
              })

        }
        <Box pt="50px" />
      </Box>
    </Box>
  );
}
