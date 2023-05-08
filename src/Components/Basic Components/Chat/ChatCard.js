import { Avatar, Box, Typography, Badge } from "@mui/material";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import utilsFunctions from "../../../utils/utils_functions";
import ConfirmDialogue from "../../DialoguePopUps/ConfirmPopup";
import CustomCardMenuButton
  from "../CustomCardMenuButton/CustomCardMenuButton";

/**
 * A chat card component that gets duplicated by parent components, and
 * in which each of the logged in user channels ( private and group chats) is
 * displayed for him to select the channel.
 * It includes the name of the channel, last message sent in the
 * it, the date time it was sent, and the number of new unread
 * messages in the channel
 * @param {*} channel - The channel its details are displayed in the chat 
 * card
 * @param {*} isChildOfNewChatComponent - When true, the current component
 * is a child of a new chat component - a component in which the logged
 * in user can select a new channel to open in order to send messages
 * in it to the other side (another user, or a group of user, if the
 * channel is a group chat) 
 * @param {*} setNewChatState - a function that can be triggered only if
 * current component is a child of new component state. When it gets the
 * false argument the new chat state is canceled and the new chat
 * component disappears
 * @param {*} unreadMessagesFilterOn - when true only cards of channels
 * that have unread messages are displayed
 * @param {*} setFilteredChannelAfterSelectCard - A function that makes
 * certain that if unread messages filter is on ( the previous 
 * parameter is true), the card will not
 * be filttered out and disappear when selected ( because selecting a
 * card means all the unread messages are all read) 
 * */
export default function ChatCard({ channel, isChildOfNewChatComponent,
  setNewChatState,
  unreadMessagesFilterOn,
  setFilteredChannelAfterSelectCard }) {

  //True when cursor is above the card
  const [isOnHover, setOnHover] = useState(false)

  //Details of logged in user
  const currUser = useSelector(state => state.authReducer).loggedInUser

  /*
  All the active channels of the logged in user (group chats or private
  chats with at least one message)
  */
  const channels = useSelector(state => state.channelsReducer).channels

  //All the private chats the user did not exchange messages in
  const uncommunicatedChannels = useSelector(
    state => state.uncommunicatedChannelsReducer).channels

  //ID and index of the channele that is selected by the logged in user
  const selectedChannel =
    useSelector(state => state.selectedChannelReducer).selectedChannel

  //When true a confirmation pop up to delete current channel displays
  const [isDeleteChannelMode, setDeleteChannelMode] = useState(false)

  /*
  When true a confirmation pop up to exit current group ( if current channel
  is indeed a group)
  */
  const [isExitGroupMode, setExitGroupMode] = useState(false)

  /*
``When true a confirmation pop up to close the current group ( if logged in
  user is its admin ) is displayed
  */
  const [isCloseGroupMode, setCloseGroupMode] = useState(false)

  //When true. a dropdown menu at the side of the component is open
  const [isMenuOpen, setMenuOpen] = useState(false)

   /*
  Hook to prevent selection of card when only the dropdown icon is clicked
  */
  const customCardMenuButtonRef = useRef(null);

  //True if current channel is a private chat and not a group chat
  const isChat = "chat_id" in channel

  //ID of channel
  const channel_id = isChat ? channel["chat_id"] : channel["group_id"]
  

  /*
  Filtering the messages sent in the channel according to the following
  rules:
  1. Messages sent in a private chat will always display
  2. messages in a group chat will display as long as they
  were sent after the join date of the logged in user to the group,
  and as long as the user did not exit the group, or was removed
  by the admin
  */
  const msgs = channel["channel_messages"].filter(message => {
    let messageDate = new Date(message["sentAt"]).getTime()
    let joinGroupDate = "join_date" in channel ?
      (new Date(channel["join_date"])).getTime() : undefined
    let removedFromGroupDate = "remove_date" in channel ?
      (new Date(channel["remove_date"])).getTime() : undefined
    let exitFromGroupDate = "exit_date" in channel ?
      (new Date(channel["exit_date"])).getTime() : undefined
    return (joinGroupDate == undefined || messageDate > joinGroupDate) &&
      (removedFromGroupDate == undefined || messageDate < removedFromGroupDate)
      &&
      (exitFromGroupDate == undefined || messageDate < exitFromGroupDate)
  })

  //Number of messages in the channel
  const msgsLen = msgs.length


  //Last message that was sent on the current channel
  const lastMessage =
    msgsLen > 0 ?
      (
        msgs[msgsLen - 1].userID == currUser["_id"] ?
          "You: " + msgs[msgsLen - 1].text : msgs[msgsLen - 1].username + ": "
          + msgs[msgsLen - 1].text
      ) : undefined


  /**
   * Function to return part of a text, as long as it's not longer than
   * a maximum length, and all of the text if it's less then the maximum.
   * Used to truncate the channel last message that is displayed on the card. 
   * @param {*} text - Text of the message that is truncated
   */
  const truncate = (text) => {
    if (text.length > 30)
      return text.substring(0, 30) + "..."
    return text

  }

  /**
   * Function to return date in the format of hours:minutes if the input 
   * date is less than 24 hours old, and in the format
   * day/month/year, hours:minutes
   * @param {*} dateString - String of date to be formatted
   */
  const formatDate = (dateString) => {
    let date = new Date(dateString)
    let day = date.getDate()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    let hour = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours()
    let minutes = date.getMinutes() >= 10 ? date.getMinutes() :
      "0" + date.getMinutes()

    let now = new Date()
    if (day == now.getDate() && month == now.getMonth() + 1 &&
      year == now.getFullYear())
      return hour + ":" + minutes

    return day + "/" + month + "/" + year + ", " + hour + ":" + minutes

  }

  /*
  Function to get name of creator (which is the admin ) of current group
  */
  const getGroupCreatorUsername = () => {
    return channel["members"].filter(member =>
      member["_id"] == channel["creator"])[0]["username"]
  }


  /**
   * Function triggered when current card is selected
   * @param {*} event - The event object sent when current card
   * is selected
   */
  const handleSelectCard = (event) => {
    /*
    Selection of current card is possible only if no pop up is displayed,
    if dropdown menu is not open and if the dropdown icon was not 
    clicked.
    */
    if (!isDeleteChannelMode && !isExitGroupMode && !isCloseGroupMode &&
      !isMenuOpen && (!customCardMenuButtonRef.current ||
        customCardMenuButtonRef.current &&
        !customCardMenuButtonRef.current.contains(event.target))) 
        {

          /*
          If filter of only cards with unread messages is on,
          the function setFilteredChannelAfterSelectCard is triggered
          so the current card will no be filtered out and disappear
          (because its selection means all the unread messages in it
          are read)
          */
          if (unreadMessagesFilterOn != undefined
            && unreadMessagesFilterOn == true)
            setFilteredChannelAfterSelectCard(channel_id)

          /*
          Calling a util function to handle thee rest of the process
          of selecting a card
          */
          utilsFunctions.selectChannel(channels, uncommunicatedChannels,
            channel, channel_id)

          /*
          Executed if parent component of current card is new chat
          component, and in that case that component disappears
          */ 
          if (isChildOfNewChatComponent)
            setNewChatState(false)
        }
  }

  /*
  A function to delete current channel so it will not display in the
  list of the channels
  */
  const deleteChannel = () => {
    setDeleteChannelMode(false)

    //Executed if current channel is a private chat
    if (isChat)
      utilsFunctions.deleteChat(channels, channel_id, currUser["_id"])

    //Executed if current channel is a group chat
    else
      utilsFunctions.deleteGroup(channels, channel_id, currUser["_id"])
  }

  /*
  Function to close current group, meaning message cannot be sent in it
  anymore
  */
  const closeGroup = () => {
    setCloseGroupMode(false)
    utilsFunctions.closeGroup(channels, channel_id)
  }

  /*
  Function to exit current group. The card will still display,
  but the logged in user will not be able to send messages anymore in it
  and see messages sent after he exited
  */
  const exitGroup = async () => {
    setExitGroupMode(false)
    utilsFunctions.exitGroup(channels, channel["group_id"],
      currUser["_id"])
  }

  return (
    <Box
      display="flex"
      onClick={(e) => handleSelectCard(e)}
      onMouseEnter={() => setOnHover(true)}
      onMouseLeave={() => setOnHover(false)}
      sx={{
        background: (channel_id == selectedChannel.id &&
          !isChildOfNewChatComponent)
          ? "#2b3943" : "#101b20",
        padding: "8px 12px",
        cursor: "pointer"
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
          {"partner" in channel ? <Typography variant="body1" color="#d1d7db">
            {
              //Name of chat partner if current channel is a private chat
              channel["partner"]["username"]
            }
          </Typography> :
            <Typography variant="body1" color="#d1d7db">
              { //Name of the current group
                channel["group_name"]
              }
            </Typography>
          }
          <Typography variant="caption" color="#d1d7db">
            {
            /*
            Displaying the date of the last activity in the channel ( last
              activity is for most part the last message sent in the channel)
            */
            !isChildOfNewChatComponent ? formatDate(channel["last_activity"]) : ""}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between"
          alignItems={'center'} width="100%"

        >
          {
          //Displaying the last messge sent in the channel 
          lastMessage && !isChildOfNewChatComponent &&
            <Typography variant="subtitle2" color="#d1d7db">
              {truncate(lastMessage)}
            </Typography>
          }
          {
          /*
          This segment is displayed when current channel is a group and
          and the group has no messages in it
          */
          !lastMessage && !isChildOfNewChatComponent &&
            <Typography variant="subtitle2" color="#d1d7db">
              {"group_id" in channel ?
                (currUser["_id"] == channel["creator"] ? "You created The group"
                  : getGroupCreatorUsername() + " added you to group") : ""
              }
            </Typography>}

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"

          >
            {
            //Messages sent in current channel
            channel["unread_messages_number"] > 0 &&
              <Typography style={{ marginRight: "55%" }}
                variant="body1" color="white">
                
                {  //Badge to display number of unread messages
                  <Badge color="success"
                  badgeContent={channel["unread_messages_number"] + ""}
                ></Badge>
                }
              </Typography>}
            {!isChildOfNewChatComponent && 
              <Typography variant="caption" color="#8496a0">
              
              {/**
               * The following box contains a dropdown menu, and has a ref hook
               * in order to indicate that selection of current card comes along
               * with clicking the button
               */}
              <Box ref={customCardMenuButtonRef}>
                {/**
                 * Dropdown button to open a dropdown menu that has
                 * the following options:
                 * 1. Delete current channel
                 * 2. Exit current group
                 * 3. Close current group
                 */}
                <CustomCardMenuButton
                  menuItems={"chat_id" in channel ? ["Delete Chat"] :
                    (("exit_date" in channel) || ("remove_date" in channel)
                      || ("close_date" in channel) ? ["Delete Group"]
                      : (
                        channel["creator"] == currUser["_id"] ? ["Close Group"] :
                          ["Exit Group"]
                      ))}
                    
                  setDeleteChannelMode={setDeleteChannelMode}
                  setExitGroupMode={setExitGroupMode}
                  setCloseGroupMode={setCloseGroupMode}
                  setMenuOpen={setMenuOpen}
                  isOnHover={isOnHover}
                  setOnHover={setOnHover}
                />
              </Box>
            </Typography>}

          </Box>


        </Box>


        <Box
          width="100%"
          mt="13px"
          sx={{
            border: ".05px solid #2f3b44",
          }}
        />
      </Box>


      {
      //A confirmation pop up to delete current channel
      isDeleteChannelMode &&
        <ConfirmDialogue
          popupDetails=
          {
            {
              title: isChat ? "Delete Chat" :
                "Delete Group",
              content: isChat ? "Are you sure you want to " +
                "delete chat with "
                + channel["partner"]["username"] :
                "Are you sure you want to delete the group '" +
                channel["group_name"] + "'?",
              confirmFunction: deleteChannel,
              exitFunction: setDeleteChannelMode
            }
          }

        />}

      {
      //A confirmation pop up to close current group
      isCloseGroupMode &&
        <ConfirmDialogue
          popupDetails=
          {
            {
              title: "Close Group",
              content: "Are you sure you want to close the group '"
                + channel["group_name"] + "'?",
              confirmFunction: closeGroup,
              exitFunction: setCloseGroupMode
            }
          }

        />}
      {
      ////A confirmation pop up to self exit current group
      isExitGroupMode &&
        <ConfirmDialogue
          popupDetails=
          {
            {
              title: "Exit Group",
              content: "Are you sure you want to exit the group '" +
                channel["group_name"] + "'?",
              confirmFunction: exitGroup,
              exitFunction: setExitGroupMode
            }
          }

        />}
    </Box>
  );
}
