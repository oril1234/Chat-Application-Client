import { Avatar, Box, Typography } from "@mui/material";
import React, {useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomCardMenuButton from "../../CustomCardMenuButton/CustomCardMenuButton";
import ConfirmDialogue from "../../../DialoguePopUps/ConfirmPopup";
import groupsSVR from "../../../../API services/groups_service";
import utils_functions from "../../../../utils/utils_functions";


/**
 * Component of a group member details displayed as a card
 * @param {*} member - Details of the member displayed in the card
 * @param {*} isCurrentUserAdmin - if true application current logged in user 
 * is the admin of the group
 * @param {*} isCurrentCardOfAdmin - True if the current group member displayed in
 * the card is also its admin
 * 
 */
export default function GroupMemberCard({ member, isCurrentUserAdmin,
   isCurrentCardOfAdmin }) {

  //True when cursor is above the component
  const [isOnHover, setOnHover] = useState(false)

  //Data object of the logged in user
  const currUser = useSelector(state => state.authReducer).loggedInUser

  //Private chats and group chats the logged in user participates in
  const channels = useSelector(state => state.channelsReducer).channels

  /*
  Private chat with users the logged in user did not exchange messages
  with
  */
  const uncommunicatedChannels = useSelector(state =>
    state.uncommunicatedChannelsReducer).channels

  //Theid and index of the channel the logged in user selected
  const selectedChannel = useSelector(state =>
    state.selectedChannelReducer).selectedChannel

  //The details of the channel the logged in user selected
  const channel = channels[selectedChannel.index]

  /*
  When true a confirmation pop up for removing current group member
  displays
  */
  const [isRemoveMemberMode, setRemoveMemberMode] = useState(false)

  //Hook to update redux reducer
  const dispatch = useDispatch()

  /*
  Hook to prevent selection of card when only the dropdown icon is clicked
  */
  const customCardMenuButtonRef = useRef(null);

  //When open the dropdown menue is open
  const [isMenuOpen, setMenuOpen] = useState(false)

  //Function for removing current group member fronm group by admin
  const removeMemberFromGroup = async () => 
  {

    setRemoveMemberMode(false)
    try {
      let removeDate=new Date()
      //Pass HTTP request to server to remove member
      let resp = await groupsSVR.removeGroupMember(channel["group_id"],
       member["_id"],removeDate)

      if (resp.status === 200) {

        //Update all the channels after removal of member
        const updatedChannels = Object.assign([], channels, {
          [selectedChannel.index]: {
            ...channels[selectedChannel.index],
            members: [...channels[selectedChannel.index].members.filter
              (m => m["_id"] !== member["_id"])],
            
          },
        })

        //Updating redux with updated channels
        dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })
        
        /*
        Updating redux wth details of the removed member in order
        to inform the member in real time regarding his removal using
        websocket connection
        */
        dispatch({ type: "UPDATE_LAST_REMOVED_GROUP_MEMBER" ,
         payload: {member_id:member["_id"],
          group_id:channel["group_id"],
          remove_date:removeDate} })

      }
    } catch (err) {
      console.log(err)
    }

  }

  /**
   * Function to select current member in order to open a chat screen
   * with him
   * @param {*} event - Event object sent when user selects the card
   */
  const handleSelectMember = (event) => {
    
    /*
    Executed if the selected member is not the logged in member
    and if the dropdown icon for opening the dropdown menu was not
    clicked
    */
    if ((currUser["_id"]!==member["_id"] && !isRemoveMemberMode &&
    !isMenuOpen && !customCardMenuButtonRef.current) ||
      (customCardMenuButtonRef.current &&
      !customCardMenuButtonRef.current.contains(event.target))) 
      {

      /*
      The index of the chat the logged in user has with the current
      member. If no such chat exists the variable equals -1
      */
      let chatWithMemberIndexInChannels = channels.findIndex(
        ch => {
          if (!("chat_id" in ch))
            return false;
          return ch["partner"]["_id"] === member["_id"]
        })

      /*
      Executed if chat with current member exists in order to select it
      */
      if (chatWithMemberIndexInChannels !== -1) {
        utils_functions.selectChannel(channels, uncommunicatedChannels,
          channels[chatWithMemberIndexInChannels],
          channels[chatWithMemberIndexInChannels]["chat_id"]
        )
      }

      /*
      Executed if chat with current member doesn't exist, and in this
      case uncommunicated chats - those with users the logged in user has
      not exchanged messages with yet, are used
      */
      else {
        let chatWithMemberIndexInUncommunicatedChannels =
          uncommunicatedChannels.findIndex(
            ch => {
              return ch["partner"]["_id"] === member["_id"]
            })

        /*
        Selecting the uncommunicated chat, meaning this chat will be
        added to the communicated channels list
        */
        utils_functions.selectChannel(channels, uncommunicatedChannels,
          uncommunicatedChannels[chatWithMemberIndexInUncommunicatedChannels],
          uncommunicatedChannels[chatWithMemberIndexInUncommunicatedChannels]["chat_id"])
      }
    }
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      //Triggered when current member is selected
      onClick={(e) => handleSelectMember(e)}
      onMouseEnter={() => { setOnHover(true) }}
      onMouseLeave={() => { setOnHover(false) }}
      sx={{
        background: isOnHover ? "#2b3943" : "#101b20",
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
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">

          <Typography variant="body1" color="#d1d7db">
            {currUser["_id"]===member["_id"]?
              member["username"]+"( You )":member["username"]}
          </Typography>
          <Typography variant="caption" color="#d1d7db">
            {isCurrentCardOfAdmin ? "admin" : ""}
          </Typography>
          {!isCurrentCardOfAdmin && isCurrentUserAdmin &&
            <Typography variant="caption" color="#8496a0">
              <Box ref={customCardMenuButtonRef}>
                <CustomCardMenuButton
                  setRemoveMemberMode={setRemoveMemberMode}
                  menuItems={["Remove Member"]} isOnHover={isOnHover}
                  setMenuOpen={setMenuOpen} 
                  />
              </Box>

            </Typography>}

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
      /*
      Pop up to confirm removal of member by logged user who is the
      admin in this case
      */
      isRemoveMemberMode && 
      <ConfirmDialogue
        popupDetails=
        {
          {
            title: "Remove Member From Group",
            content: "Are you sure you want to remove " + member["username"] +
              " from the group '" + channel["group_name"] + "'?",
            confirmFunction: removeMemberFromGroup,
            exitFunction: setRemoveMemberMode
          }
        } />}
    </Box>
  );
}
