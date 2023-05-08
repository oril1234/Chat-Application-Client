import { Box, Card, CardContent, IconButton, Typography } from "@mui/material"
import CustomAppBar from "../../CustomAppBar/CustomAppBar"
import CloseIcon from '@mui/icons-material/Close';
import GroupMemberCard from "../../Group/groupMemberCard/groupMemberCard";
import ExitGroupButton from "../../Group/exitGroupButton/exitGroupButton";
import { useEffect, useState } from "react";
import NewGroupMembers from "../../Group/newGroupMembers/newGroupMembers";
import NewGroupMembersButton from "../../Group/newGroupMembersButton/newGroupMembersButton";
import ConfirmDialogue from "../../../DialoguePopUps/ConfirmPopup";
import groupsSVR from "../../../../API services/groups_service";
import {useSelector } from "react-redux";
import CloseGroupButtoon from "../../Group/closeGroup/closeGroup";
import SharedGroupCard from "../../Group/sharedGroup/sharedGroupCard";
import BlockUserButton from "../../UsersBlocks/blockUserButton";
import UnblockUserButton from "../../UsersBlocks/unblockUserButton";
import DeleteChannelButton from "../deleteChannelButton/deleteChanneButton";
import utils_functions from "../../../../utils/utils_functions";

/**
 * This component is of the side section that displays information about the 
 * channel (chat with another user or a group) that the logged in user selected
 * @param {*} channel - Channel its details are displayed in the component
 * @param {*} setShowInfoSection - Function that when triggered with the argument
 * of false deletes the current component
 */
export default function Channelnfo({ channel, setShowInfoSection }) {

    //User that is currently connected to app
    const currUser = useSelector(state => state.authReducer).loggedInUser

    //True if selected channel is a group chat
    const isGroup = "group_id" in channel

    /*
    True if selected channel is a private chat
    or a group chat the loggesd in user did not leave, 
    was not removed from and the group admin did not close it
    */
    const isChannelAvailable = !("exit_date" in channel) &&
        !("remove_date" in channel) && !("close_date" in channel)

    /*
    True if current channel is a group and the logged in user is its admin
    */
    const isCurrentUserAdmin = isGroup && 
        channel["creator"] === currUser["_id"]

    /*
    Data object if the selected channel the holds the id of the selected
    channel and the index of it within the array of channels stored in 
    redux reducer
    */
    const selectedChannel =
        useSelector(state => state.selectedChannelReducer).selectedChannel

    //Array of channels
    const channels = useSelector(state => state.channelsReducer).channels

    //ID of selected channel
    const channel_id = !isGroup ? channel["chat_id"] : channel["group_id"]

    /*
    When true a pop up for adding a new member to the selected group
    (in a case the selected channel is a group chat) displays
    */
    const [isNewMembersMode, setNewMembersMode] = useState(false)

    /*
    When true a confirmation pop up for existing the selected group
    (in a case the selected channel is a group chat) displays
    */
    const [isExitGroupMode, setExitGroupMode] = useState(false)

    /*
    When true a confirmation pop up for closing the selected group
    (in a case the selected channel is a group chat and the logged in
    user is its admin) displays
    */
    const [isCloseGroupMode, setCloseGroupMode] = useState(false)

    /*
    When true a confirmation pop up for deleting the selected channel
    (whether selected channel is a private or a group chat) displays
    */
    const [isDeleteChannelMode, setDeleteChannelMode] = useState(false)

    /*
    When true a confirmation pop up for blocking a user ( in a case the
    selected channel is a private chat) displays
    */
    const [isBlockUserMode, setBlockUserMode] = useState(false)

    /*
    When true a confirmation pop up for canceling a blocking a user ( in a 
    case the selected channel is a private chat) displays
    */
    const [isUnblockUserMode, setUnblockUserMode] = useState(false)

    /*
    Groups that are mutual to the logged in user and his chat partner
    if selected channel is a private chat
    */
    const [sharedGroups, setSharedGroups] = useState([])

    useEffect(() => {

        /*
        A function to fetch shared Groups between logged in user
        and his chat partner if selected channel is a private chat
        */ 
        const getSharedGroups = async () => {
            let response = await groupsSVR.getUsersSharedGroups(channel["user_id"],
                channel["partner"]["_id"])
            let sharedGroupsData = response.data.data
            setSharedGroups(sharedGroupsData)
        }

        //Executed if selected channel is a private chat
        if ("partner" in channel && sharedGroups.length===0) {
            getSharedGroups()
        }
    }, [])

    //A Function for a group member to exit selected group
    const exitGroup = async () => {
        setExitGroupMode(false)
        utils_functions.exitGroup(channels, channel["group_id"],
            currUser["_id"], selectedChannel.index)
    }

    /*
    A Function for closing the selected group by its admin, meaning the
    group is no longer active and messages cannot be sent
    */
    const closeGroup = () => {
        setCloseGroupMode(false)
        utils_functions.closeGroup(channels, channel["group_id"],
            selectedChannel.index)
    }

    /*
    A function for deleting a channel, meaning it won't display in
    the list of the logged in user channels
    */
    const deleteChannel = () => {
        setDeleteChannelMode(false)
        if (!isGroup)
            utils_functions.deleteChat(channels, channel_id, currUser["_id"])
        else
            utils_functions.deleteGroup(channels, channel_id, currUser["_id"])
    }

    /*
    A function triggered when the logged in user blocks his chat
    partner in the selected chat
    */
    const blockUser = () => {
        setBlockUserMode(false)
        utils_functions.blockUser(channels, channel["chat_id"],
            currUser["_id"], channel["partner"]["_id"],
            selectedChannel.index)
    }

    /*
    A function triggered when the logged in user cancels blocking 
    of his chat partner in the selected chat
    */
    const unblockUser = () => {
        setUnblockUserMode(false)

        utils_functions.unblockUser(channels,channel["chat_id"],currUser["_id"],
          channel["partner"]["_id"],selectedChannel.index)
    }


    return (
        <Box height="100%">
            <CustomAppBar>
                <Box
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box display="flex">
                     
                        <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            pl="10px"
                        >
                            <IconButton
                                onClick={() => { setShowInfoSection(false) }}
                                sx={{
                                    paddingRight: "10px",
                                }}
                            >
                                <CloseIcon
                                    sx={{
                                        color: "#afbac0",
                                    }}
                                />
                            </IconButton>
                            <Typography variant="body1" color="white">
                                {isGroup ? "Group Info" : "User Info"}
                            </Typography>

                        </Box>
                    </Box>

                </Box>
            </CustomAppBar>
            <Box height="85.2%">
                <Box
                    sx={{
                        height: '100%',
                        width: "100%",

                        flexDirection: 'row',
                        pl: 3,
                        overflow: "hidden",
                        overflowY: "scroll"

                    }}
                >

                    {/**A card for displaying channel details */}
                    <Card sx={{ minWidth: 275, alignContent: "flex-start" }}>
                        <CardContent>

                            <Typography variant="h5" component="div">
                                {"group_name" in channel ?
                                    channel["group_name"] : channel["partner"]["username"]}
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                {isGroup ?
                                    channel["members"].length + " members" :
                                    channel["partner"]["_id"]}
                            </Typography>
                            {!isGroup && <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                {channel["partner"]["phoneNumber"]}
                            </Typography>}
                        </CardContent>

                    </Card>
                    <Box display="flex" justifyContent="start" width="100%"
                        sx={{ mt: 3, mb: 2 }}>
                        <Typography>{isGroup ? "Group Members:" : (
                            sharedGroups.length > 0 ? "Shared Groups:" :
                                "No shared groups"
                        )}</Typography>
                    </Box>

                    {
                        /*
                        Displaying group members if selected channel
                        is a group
                        */
                        isGroup ?
                            channel["members"].map(member => {
                                return (
                                    <GroupMemberCard
                                        member={member}
                                        key={member["_id"]}
                                        isCurrentUserAdmin={isCurrentUserAdmin}
                                        isCurrentCardOfAdmin={channel["creator"] === member["_id"]}
                                    />)
                            }) :

                            /*
                            Displayingdetails of shared groups between
                            logged in user and his chat partner
                            if selected channel is a prviate chat 
                            */
                            sharedGroups.map((group) => {
                                return (
                                    <SharedGroupCard
                                        key={group["_id"]}
                                        group={group}
                                    />)
                            })
                    }


                    {
                    /* A button for adding new members to
                    group if selected channel is a group, and logged
                    in user is its admin 
                    */
                    isChannelAvailable && isGroup &&
                        isCurrentUserAdmin &&
                        <NewGroupMembersButton setNewMembersMode={setNewMembersMode} />}
                    {
                        /*
                        A pop up for choosing new members to add to the
                        group from a list
                        */
                        isChannelAvailable && isGroup &&
                        isNewMembersMode &&
                        <NewGroupMembers
                            setNewMembersMode={setNewMembersMode}
                            group={channel} />
                    }

                    {
                    /*
                    A button for existing the selected group which is
                    available to a group member who is not the group
                    admin. When clicked a confirmation pop up opens.
                    */
                    isChannelAvailable && isGroup &&
                        !isCurrentUserAdmin &&
                        <ExitGroupButton setExitGroupMode={setExitGroupMode} />}

                    {
                    /*
                    A button for closing the group as long as the
                    selected channel is a group
                    */
                    isChannelAvailable && isGroup &&
                        isCurrentUserAdmin &&
                        <CloseGroupButtoon
                             setCloseGroupMode={setCloseGroupMode} />}
                    
                    
                    {

                    /*
                    A button for deleting a group from the list of
                    channels of logged in user.
                    Displays only after logged in user existed the
                    group before, was removed from itm or if the admin
                    closed the group
                    */
                    !isChannelAvailable &&
                        <DeleteChannelButton
                            isGroup={isGroup}
                            setDeleteChannelMode={setDeleteChannelMode}
                        />}


                    {
                    /*
                    A button for deleting a private chat from the list of
                    channels of logged in user
                    */
                    !isGroup &&
                        <DeleteChannelButton
                            isGroup={isGroup}
                            setDeleteChannelMode={setDeleteChannelMode}
                        />}


                    {
                    /*
                    A button for blocking the chat partner in the
                    selected chat by the logged in user.
                    Available when selected channel is a private
                    chat, and the patner has not been blocked yet
                    */
                    !isGroup && channel["blocks_data"].length === 0 &&
                        <BlockUserButton setBlockUserMode={setBlockUserMode} />}
                    
                    
                    {
                    /*
                    A button for cancelling blocking ofthe of chat partner
                    in the selected chat by the logged in user.
                    Available when selected channel is a private
                    chat, and the patner has been previously blocked yet
                    */
                    !isGroup && channel["blocks_data"].length > 0 &&
                        <UnblockUserButton setUnblockUserMode={setUnblockUserMode} />}
                </Box>


            </Box>

            {
            //A confirmation pop up to exit selected group
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
            //A confirmation pop up for closing the selected group
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
            //A confirmation pop up for deleting selected channel
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


            {
            /*
            A confirmation pop up for blocking chat partner of selected
            chat 
            */
            !isGroup && isBlockUserMode &&
                <ConfirmDialogue
                    popupDetails=
                    {
                        {
                            title: "Block User",
                            content: "Are you sure you want to block "
                                + channel["partner"]["username"] + "?",
                            confirmFunction: blockUser,
                            exitFunction: setBlockUserMode
                        }
                    }

                />}

            {
            /*
            A confitm pop up for cancelling blocking of chat partner
            of selected chat
            */
            !isGroup && isUnblockUserMode &&
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

        </Box>
    )
}