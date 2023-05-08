import { Avatar, Box,IconButton, Input, Typography } from "@mui/material";
import CustomAppBar from "./CustomAppBar/CustomAppBar";
import RightPanelMenuButton from "./CustomMenuButton/RightPanelMenuButton";
import bg from "../../assets/background.png";
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useRef, useState } from "react";
import MessagesArea from "./MessagesArea/MessagesArea";
import { useDispatch, useSelector } from "react-redux";
import Channelnfo from "./channel/channelInfo/channelInfo";
import { v4 } from 'uuid'
import utils_functions from "../../utils/utils_functions";
import ConfirmDialogue from "../DialoguePopUps/ConfirmPopup";
import messagesSVR from "../../API services/users_messages_service";

/**
 * Right panel of the application which is used to display the window
 * of chat the user selected, and an app bar with a menu for the user in
 * order to perform different actions like blocking a chat partner, if the
 * selected chat is a private one, or exitting a group if the user selected
 * a group chat   
 */
export default function RightPanel() {

  //The logged in user
  const currUser = useSelector(state => state.authReducer).loggedInUser

  //Private and group chats of the logged in user
  const channels = useSelector(state => state.channelsReducer).channels

  //ID and index of the selected channel
  const selectedChannel =
    useSelector(state => state.selectedChannelReducer).selectedChannel

  /*
  A key/value data structure storing the connection status of each of the users
  the logged in user has chats with
  */
  const usersConnectionsStatus =
    useSelector(state => state.onlineUsersReducer).onlineUsers

  //Selected channel details
  const channel = channels[selectedChannel.index]

  //True if current channel is a group chat
  const isGroup="group_id" in channel

  /*
  True if logged in user is blocked by his chat partner if selected channel
  is a private chat
  */
  const isBlocked = "blocks_data" in channel &&
    channel["blocks_data"].findIndex(block_data =>
      block_data["blocked_id"] === currUser["_id"]) !== -1

  /*
  True if logged in user blocked his chat partner if selected channel
  is a private chat
  */
  const isBlocking = "blocks_data" in channel &&
    channel["blocks_data"].findIndex(block_data =>
      block_data["blocker_id"] === currUser["_id"]) !== -1

  /*
  True if current channel is a group and the user was removed from it by the admin
  (in this case the logged in user still can see the messages sent before he was
  removed, but can't send ones )
  */
  const was_removed_from_group="remove_date" in channel

  /*
  True if current channel is a group and the user exited from it by himself
  (in this case the logged in user still can see the messages sent before he exited,
  but can't send ones )
  */
  const did_exit_group="exit_date" in channel

  /*
  True if current channel is a group that was closed by the admin
  (in this case the logged in user still can see the messages sent before the
  group was closed, but can't, along with all the other members send messages
  anymore )
  */
  const is_group_closed="close_date" in channel

  /*
  True if current channel is a group and the logged in user can still send
  and receive messages in it
  */
  const isChannelAvailable = !did_exit_group &&
  !was_removed_from_group && !is_group_closed

  /*
  Ref hook used as a point of a reference to which messages window is
  scrolled to wheber a new message is sent in the chat
  */
  const messagesEndRef = useRef(null)

  //Thw text of a new message the logged in user enters to add to chat
  const [messageInput, setMessageInput] = useState("")

  //When true a section with the current channels details is displayed
  const [showInfoSection, setShowInfoSection] = useState(false)

  //Hook to update redux reducer
  const dispatch = useDispatch()

  /*
  When true a confirmation pop up for blocking the chat partner in the select chat
  displays
  */
  const [isBlockUserMode, setBlockUserMode] = useState(false)

  /*
  When true a confirmation pop up for cancelling blocking of the chat partner
  by the logged in user in the select chat displays
  */
  const [isUnblockUserMode, setUnblockUserMode] = useState(false)

  /*
  When true a confirmation pop up for the logged in user to exit the
  selected group displays 
  */
  const [isExitGroupMode, setExitGroupMode] = useState(false)

  /*
  When true a confirmation pop up for the logged in user to close the
  selected group (if he's its admin) displays 
  */
  const [isCloseGroupMode, setCloseGroupMode] = useState(false)

  /*
  When true a confirmation pop up for the logged in user to delete the selected
  channel ( meaning the channel will not appear for him on the list
  of his channels) displays
  */
  const [isDeleteChannelMode, setDeleteChannelMode] = useState(false)

  /*
  Items of right panel app bar menu displayed as long as the selected channel
  is a group, and depending on the status of the logged in user in the group
  (if the group is available for him to send and receive messages and if he's
  its admin)
  */
  const groupMenuItems = isGroup? ["Group Info",
  ...(isChannelAvailable ? [(channel["creator"]===currUser["_id"]?
    "Close Group":"Exit Group")]
   : ["Delete Group"])]:[]

  /*
  Items of right panel app bar menu displayed as long as the selected channel
  is a private chat, and depending on the status of the logged in user in the chat
  (if is chat partner is not blocked and the user wants to block him, or if he
  is and the user want to cancel the blocking)
  */
  const chatMenuItems = ["Contact Info","Delete Chat",
  ...(isBlocking ? ["Unblock"] : ["Block"]),];

  /*
  Function triggered in order to scroll the chat window to the bottom 
  */
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView()
  }


  useEffect(() => {

    /*
    Scrolling the the chat window to the bottom after a change was made
    in the selected channel ( such as new message that was sent or received,
    or a blocking of a user that was added etc.)
    */
    scrollToBottom()

  }, [channel]);

  useEffect(() => {

    /*
    Triggered whenver the logged in user selects another channel to close the
    channel information section in a case it displays
    */ 
    setShowInfoSection(false)
  }, [selectedChannel]);


  //Style of button of sending a new message
  const sendIconStyle = {
    color: "#8696a1",
    height: "28px",
    width: "28px",
  };


  /*
  A function triggered after the logged in user confirms he wishes to block his chat
  partner in the selected channel
  */
  const blockUser = () => {
    //Triggered in order to remove confirmation pop up for blocking a user 
    setBlockUserMode(false)

    //Function triggered in order to complete the process of blocking a user
    utils_functions.blockUser(channels, channel["chat_id"],
        currUser["_id"], channel["partner"]["_id"],
        selectedChannel.index)
  }

  /*
  A function triggered after the logged in user confirms he wishes to cancel the 
  blocking of his chat partner in the selected chat
  */
  const unblockUser = async () => {

      //Triggered in order to remove confirmation pop up for unblocking a user 
      setUnblockUserMode(false)

      //Function triggered in order to complete the process of unblocking a user
      utils_functions.unblockUser(channels,channel["chat_id"],currUser["_id"],
        channel["partner"]["_id"],selectedChannel.index)
  }

  /*
  A function triggered after the logged in user confirms he wishes to exit 
  selected group
  */
  const exitGroup = async () => {
    
    //Triggered in order to remove confirmation pop up for exiting a group
    setExitGroupMode(false)

    //Function triggered in order to complete the process of exiting the group
    utils_functions.exitGroup(channels, channel["group_id"],
        currUser["_id"], selectedChannel.index)
}

  /*
  A function triggered after the logged in user confirms he wishes to close
  selected group, as long as he's the admin
  */
  const closeGroup = () => {

      //Triggered in order to remove confirmation pop up for closing a group
      setCloseGroupMode(false)

      //Function triggered in order to complete the process of closing the group
      utils_functions.closeGroup(channels, channel["group_id"],
          selectedChannel.index)
  }

  /*
  A function triggered after the logged in user confirms he wishes to close
  delete current channel
  */
  const deleteChannel = () => {

      //Triggered in order to remove confirmation pop up for deleting channel
      setDeleteChannelMode(false)

      /*
      Executed when current channel is not a group in order to complete the
      process of deleting private chat
      */
      if (!isGroup)
          utils_functions.deleteChat(channels, selectedChannel.id,
            currUser["_id"])

      /*
      Executed when current channel is a group in order to complete the
      process of deleting group chat
      */
      else
          utils_functions.deleteGroup(channels,selectedChannel.id,
            currUser["_id"])
  }

  //A function triggerd when the user adds a new message
  const addMessage = async () => {
    /*
    If current channel is a private chat channel["group_id"] will be undefined,
    else channel["chat_id"] and channel["partner_id"] will be undefined
    */
    let chat_id = channel["chat_id"], partner = channel["partner"],
      group_id = channel["group_id"]

    //ID of the message      
    let message_id = v4()

    //Message details
    let newMessage =
    {
      //Message ID  
      _id: message_id,
      //ID of chat in which the message was sent if selected channel is private chat
      ...(chat_id !== undefined && { chatID: chat_id }),
      //ID of group in which the message was sent if selected channel is group chat
      ...(group_id !== undefined && { groupID: group_id }),
      /*
      The user with whom logged in user is chatting if selected channel is a
      private chat
      */
      ...(partner !== undefined && { to: partner["_id"] }),
      //ID of the sender of the message
      userID: currUser["_id"],
      //Name of the sender of the message
      username: currUser["username"],
      //Text of the message
      text: messageInput,
      //Date time in which the message was sent
      sentAt: new Date()
    }
    
    try {
      //Adding message to server
      let resp = await messagesSVR.addMessage(newMessage)

      //Executed if message added properly
      if (resp.status === 200) {

        //Updated channels after adding new message
        const updatedChannels = Object.assign([], channels, {
          //Updating specific channel in which the message was sent
          [selectedChannel.index]: {
            ...channels[selectedChannel.index],
            /*
            Date time of the last activity in the channel which is the date time
            of the last message in it
            */
            last_activity: new Date() + "",
            //Adding new message to array of messages in the channel
            channel_messages: [...channels[selectedChannel.index].channel_messages,
              newMessage],
            /*
            The number if unread messages the user had in the channel before he
            selected it. Gets reset whenever the user himself sends a new message
            */
            previous_unread_messages_number:0
          },
        })

        //Update redux reducer with updated channel
        dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })
        
        /*
        Full data of the logged in user, for the recipient
        of the message if the chat with logged in user does not apear in the
        recipient channel's list
        */
        newMessage["sender_data"]=currUser

        /*
        Updating redux reducer with the new message details to be sent to recepient
        in real time with socket.io instances in client and server
        */
        dispatch({ type: "UPDATE_LAST_SENT_MESSAGE", payload: newMessage })

      }
    } catch (err) {
      console.log(err)
    }

    //Reseting message input
    setMessageInput("")

  }

  return (
    <Box height="100%" width="70%" display="flex" flexDirection="row">
      <Box width={showInfoSection ? "70%" : "100%"}>
        {
          //App bar of right pannel
          <CustomAppBar>
            <Box
              width="100%"
              height="100%"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex">
                <Avatar />
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  pl="10px"
                >
                  <Typography variant="body1" color="white">
                    {"group_name" in channel ? channel["group_name"] :
                      channel["partner"
                      ]["username"]}
                  </Typography>
                  {"partner" in channel && 
                  //Connection status of the chat partner
                  <Typography variant="caption" color="#8496a0">
                    {usersConnectionsStatus.has(channel["partner"]["_id"])?
                    (usersConnectionsStatus.get(channel["partner"]["_id"])?
                    "Online":"Offline"):""}
                  </Typography>}
                </Box>
              </Box>
              <Box display="flex">

                {
                  /*
                  Dropdown menu for the user to preform different actions
                  like blocking a user, leaving a group, deleting cgat, etc.
                  */
                  <RightPanelMenuButton 
                    setShowChannelInfoSection={setShowInfoSection}
                    setBlockUserMode={setBlockUserMode}
                    setUnblockUserMode={setUnblockUserMode}
                    setExitGroupMode={setExitGroupMode}
                    setCloseGroupMode={setCloseGroupMode}
                    setDeleteChannelMode={setDeleteChannelMode}
                  
                    //Items of dropdown menu for the user to select
                    menuItems={
                      !isGroup ?
                        chatMenuItems : groupMenuItems} 
                  />
                }
              </Box>
            </Box>
          </CustomAppBar>
        }
        <Box height="85.2%">
          <Box
            sx={{
              height: '100%',
              width: "100%",
              backgroundImage: `url(${bg})`,
              flexDirection: 'column',
              pl: 3,
              overflow: "hidden",
              overflowY: "scroll"
            }}
          >
            {
              //All the messages sent in the channel
              <MessagesArea channel={channel} />
            }
            <div className="message sent"
              style={{ backgroundColor: 'transparent' }} ref={messagesEndRef}>
            </div>
          </Box>

        </Box>
        <Box
          height="62px"
          alignItems="center"
          display="flex"
          sx={{
            background: "#1f2c33",
            padding: "0px 15px",
          }}
        >

          <Box flex={1} pl="5px" pr="5px">
            {!isBlocked && !isBlocking && !was_removed_from_group &&
             !is_group_closed && !did_exit_group &&
             //Input field for the user to enter a new message
             <Input
              fullWidth
              disableUnderline
              placeholder="Type a message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={
                (e) => {
                  if (messageInput !== "" && e.key === "Enter")
                    addMessage()
                }
              }
              sx={{
                background: "#2b3943",
                height: "42px",
                borderRadius: "6px",
                color: "white",
                padding: "0px 10px",
              }}
            />
            }
            {
              //This section displays when the logged in user blocked his chat partner
              isBlocking &&
                <Typography>
                  {"You blocked " + channel["partner"]["username"] + ". To unblock "}
                  <Box onClick={() => setUnblockUserMode(true)} component="span"
                    sx={{ cursor: "pointer", color: "#C5EFEF" }}>click
                  </Box>
                </Typography>
              }
            {
              /*
              This section displays only when logged in user is blocked by his chat
              partner, but the logged in user doesn't block him
              */
              !isBlocking && isBlocked &&
                <Typography>
                  {"You can't send messages to " + channel["partner"]["username"]}
                </Typography>
            }
            {
              /*
              This section displays if current channel is a group, and the user
              was removed from it by its admin
              */
              was_removed_from_group &&
              <Typography>
                {"You were removed from group by admin and can't send messages."}
              </Typography>
            }   
            {
              /*
              This section displays if current channel is a group, and the user
              exited it by himself
              */
              did_exit_group &&
              <Typography>
                {"You exited from group and can't send messages."}
              </Typography>
            } 
                         
            {

              /*
              This section displays if the group was closed by its admin,
              and the user was not removed from it or exit by himself before
              */
              is_group_closed && !did_exit_group &&
              !was_removed_from_group &&
              <Typography>
                {currUser["_id"]===channel["creator"]?
                "You closed the group, ":
                "Group was closed by admin. "}Messages cannot be sent.
              </Typography>
            }           </Box>
          {messageInput !== "" && 
          //Button to confirm addition of new message by the user
          <IconButton onClick={() => addMessage()}>
            <SendIcon
              sx={sendIconStyle}
            />
          </IconButton>}
        </Box>
      </Box>
      {
        //Section of channel information
        showInfoSection && <Box width="30%">
        <Channelnfo
          channel={channel}
          setShowInfoSection={setShowInfoSection}
        />
      </Box>
      }

      {
        //Confirmation pop up for blocking chat partner
        "chat_id" in channel && isBlockUserMode &&
        <ConfirmDialogue
          popupDetails=
          {
            {
              title: "Block User",
              content: "Are you sure you want to Block "
                + channel["partner"]["username"] + "?",
              confirmFunction: blockUser,
              exitFunction: setBlockUserMode
                        
            }
          }

        />}
      {
      //Confirmation pop up for cancelling blocking of chat partner
      "chat_id" in channel && isUnblockUserMode &&
        <ConfirmDialogue
          popupDetails=
          {
            {
              title: "Unblock User",
              content: "Are you sure you want to unblock "
                + channel["partner"]["username"] + "?",
              confirmFunction: unblockUser,
              exitFunction: setUnblockUserMode,
              greenBackground: true
            }
          }

        />}
            {
              //Confirmation pop up for leaving the group
              isGroup && isExitGroupMode &&
                <ConfirmDialogue
                    popupDetails=
                    {
                        {
                            title: "Exit Group",
                            content: "Are you sure you want to exit the group '"
                                + channel["group_name"] + "'?",
                            confirmFunction: exitGroup,
                            exitFunction: setExitGroupMode
                        }
                    }

                />}
            {
              //Confirmation pop up for closing current group by user who is the admin
              isGroup && isCloseGroupMode &&
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
            /*
            Confirmation pop up for deleting current channel from user's channels list
            */
            isDeleteChannelMode &&
                <ConfirmDialogue
                    popupDetails=
                    {
                        {
                            title: !isGroup ? "Delete Chat" :
                                "Delete Group",
                            content: !isGroup ? "Are you sure you want to " +
                                "delete chat with "
                                + channel["partner"]["username"] :
                                "Are you sure you want to delete the group '" +
                                channel["group_name"] + "'?",
                            confirmFunction: deleteChannel,
                            exitFunction: setDeleteChannelMode
                        }
                    }

                />}        
    </Box>
  );
}
