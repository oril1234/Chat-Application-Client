import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import messagesSVR from "../../API services/users_messages_service";
import generalSVR from "../../API services/general_service";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import { useDispatch, useSelector } from "react-redux";
import io from 'socket.io-client';
import NewGroup from "./Group/NewGroup";
import NewChat from "./Chat/NewChat";
import usersSVR from "../../API services/users_service";

/**
 * A parent component of most of the app components displayed to
 * the user when he logs in, including the list of all the user's
 * channels - his private and group chats which he can select,
 * and the chat window with its messages of the selected channel
 */
export default function Homepage() {

  //The ip of the device on which the application operates
  const ip = window.location.hostname

  //The logged in user
  const currUser = useSelector(state => state.authReducer).loggedInUser

  //The channel (private and group chats) of the user
  const channels = useSelector(state => state.channelsReducer).channels

  //Hook to uodate redux reducer
  const dispatch = useDispatch()

  //ID's of the private chat's partners of the logged in user
  const [partnersIDs, setPartnersIDs] = useState([])

  //ID's of the groups of the user 
  const [groupsIDs, setGroupsIDs] = useState([])

  /*
  ID and index of the channel selected by the user, meaning its messages
  window displays
  */
  const selectedChannel =
    useSelector(state => state.selectedChannelReducer).selectedChannel

  /*
  Last message sent by the logged in user. Whenever the variable 
  updates, socket.io library instance is triggered to update
  the recipient of the message in real time
  */
  const lastSentMessage =
    useSelector(state => state.lastSentMessageReducer).message

  /*
  Last group created by the user. Whenever the variable 
  updates, socket.io library instance is triggered to update
  the new group members in real time
  */
  const lastCreatedGroup =
    useSelector(state => state.lastCreatedGroupReducer).group

  /*
  Last group closed by the user. Whenever the variable 
  updates, socket.io library instance is triggered to update
  the group members of the closure in real time
  */
  const lastClosedGroup =
    useSelector(state => state.lastClosedGroupReducer).closure_data

  /*
  Last members added to an existing group by the user. Whenever the
  variable updates, socket.io library instance is triggered to update
  the new group members of them joining the group in real time
  */
  const lastAddedGroupMembers = useSelector(state =>
    state.lastAddedGroupMembersReducer).addedMembersData

  /*
  Last member removed from a group by the user. Whenever the
  variable updates, socket.io library instance is triggered to update
  the new group members of them leaving the group in real time
  */
  const lastRemovedGroupMember = useSelector(state =>
    state.lastRemovedGroupMemberReducer).removedMemberData

  /*
  Last blocking made by the logged in user. Whenever the
  variable updates, socket.io library instance is triggered to update
  the user who's blocked in real time.
  */
  const lastUserBlock =
    useSelector(state => state.lastUserBlockReducer).block_details

  /*
  Last blocking cancelation made by the logged in user. Whenever the
  variable updates, socket.io library instance is triggered to update
  the user who's blocking by the logged in user is canceled in real time.
  */
  const lastUserUnblock =
    useSelector(state => state.lastUserUnblockReducer).unblock_details

  /*
  When true, a new group creation section displays
  */
  const [isNewGroupMode, setNewGroupMode] = useState(false)

  /*
  When true, a new chat section displays
  */
  const [isNewChatMode, setNewChatMode] = useState(false)


  /**
   * Function called whenver the logged in user receives a message
   * from a user in a private chat that is not in list of the logged
   * in user channels (private and chat groups )
   * @param {*} message - The message that is received
   */
  const handleFirstSentMessageOfPrivateChat = (message) => {
    const newChannel = {
      //ID of the new private chat
      chat_id: message["chatID"],
      //User that is the chat partner of the logged in user
      partner: message["sender_data"],
      //ID of logged in user
      user_id: currUser["_id"],
      //Number of unread messages of the logged in user
      unread_messages_number: 1,
      /*
      Date time of the last activity in the channel which is basically
      the date time of the last message sent in the channel
      */
      last_activity: message["sentAt"] + "",
      /*
      Array of details of blocking made by the logged in user on
      his partner. or the other way around. For starters this
      array is empty, because otherwise sending this message would have
      been impossible
      */
      block_data:[],
      /*
      Messages of the channel which for starters include only 1 message
      */
      channel_messages: [message],
    }

    /*
    Updating redux reducer with the updated channel including the
    new one    
    */
    dispatch({ type: "UPDATE_CHANNELS", payload: [...channels, newChannel] })

  }

  /**
   * Function to handle reception of a new message
   * @param {*} message - The messgase that is received.
   */
  const handleReceiveMessage = (message) => {
    /*
    True if current message is a private chat message, false if message was 
    sent in a group
    */
    let isChatMessage = "chatID" in message

    /*
    ID of the channel. chat id if the channel is a private chat id, and
    group id otherwise
    */
    let channel_id = isChatMessage ? message["chatID"] : message["groupID"]

    //Index of the channel to which the new message was sent
    let newMessageChannelIndex = [...channels].findIndex(channel => {

      let ch_id = "chat_id" in channel ? channel["chat_id"] : channel["group_id"]
      let message_channel_id = isChatMessage ? message["chatID"] : message["groupID"]
      return ch_id === message_channel_id
    })

    /*
    If channel was not found, it means the new message arrived from
    a new private chat ( because the list of user's channels include
    2 types of a channels - all the group chats, and all the private
    chats in which was sent at least 1 message, so it is inferred
    by the elimination method the source of the message is a
    private chat )
    */
    if (newMessageChannelIndex == -1) {
      handleFirstSentMessageOfPrivateChat(message)
      return
    }

    /*
    True if logged in user has left the group, either by himself, or
    has been removed by the group admin
    */
    let isExMemberOFGroup = "remove_date" 
      in channels[newMessageChannelIndex] ||
      "exit_date" in channels[newMessageChannelIndex]
    
    //Execute if logged in user has left the group
    if (isExMemberOFGroup)
      return

    /*
    True if the channel that is currently selected is the destinaction
    of the message
    */
    let isSelectedChannel = channel_id == selectedChannel.id

    /*
    Current number of unread message of the logged in user in the channel
    */
    let currUnreadMessgesNum =
      channels[newMessageChannelIndex]["unread_messages_number"]

    //The current logged in user channels, including new message
    const updatedChannels = Object.assign([], channels, {
      //Updating the channel of the message by the index
      [newMessageChannelIndex]: {
        ...channels[newMessageChannelIndex],

        //Updated channel messages
        channel_messages: 
          [...channels[newMessageChannelIndex].channel_messages, message],

        /*
        Last activity in the channel which is the date time the message was
        sent
        */
        last_activity: message["sentAt"] + "",
        //Updated number of unread messages in the channel
        unread_messages_number:isSelectedChannel ? 0 
          :(message["userID"]===currUser["_id"]?currUnreadMessgesNum:
           currUnreadMessgesNum + 1)

      },
    })

    //Updating redux with updated channels
    dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })
    
    /*
    Update the number of unread messages to be 0 if the channel
    (chat or group ) id to which the message belongs to the selected
    channel
    */
    if (isSelectedChannel) {

      //Read unread messages of a private chat
      if (isChatMessage)
        messagesSVR.readChatUserUnreadMessages(currUser["_id"],
          message["chatID"], "read all")

      //Read unread messages of a group chat
      else
        messagesSVR.readGroupUsersUnreadMessages(currUser["_id"],
          message["groupID"], "read all")
    }

  }

  
  /**
   * Function triggered when logged in user is added by another
   * user to a group
   * @param {*} groupData - Details of the group the logged in user is
   * added to
   */
  const handleBeingAddedToGroup = (groupData) => {
    let channelsCopy = null

    /*
    Index of the group in the list of channels, found if the group is already
    on that list
    */
    let group_index = [...channels].findIndex(ch => {
      if ("chat_id" in ch)
        return false;
      return ch["group_id"] == groupData["group_id"]
    })

    /*
    If such index was found it means the user previouslu was part of the group
    and left it, either by himself, or by being removed by the admin
    */
    if (group_index != -1) {
      channelsCopy = Object.assign([], channels, {
        //Updating the specific group
        [group_index]: {
          ...channels[group_index],
          //Date of rejoining the group
          join_date:new Date(),
          //Adding logged in user to the list of members
          members:[...channels[group_index].members,currUser]
        },
      })

      //Delete fields previously added as a sign of his departure
      delete channelsCopy[group_index]["remove_date"]
      delete channelsCopy[group_index]["exit_date"]
    }

    /*
    Executed if group is not part of the user's channels, meaning either 
    it's the first time he's added to this group, or he was previously part
    of it, left it, and deleted the it completely from his list of channels
    */
    else 
    {
      let channel = 
      {
        //ID of new group
        group_id: groupData["group_id"],
        //The user who created the group
        creator: groupData["creator"],
        //Name of group
        group_name: groupData["group_name"],
        //Date user joined the group
        join_date: new Date(),
        /*
        Date time of the last activity in the group which either when it
        was formed, or when the last message was sent in it
        */
        last_activity: groupData["last_activity"],
        //Group members
        members: groupData["members"],
        //ID of logged in user
        user_id: currUser["_id"],
        /*
        Messages sent in the group. Empty because user doesn't see messages sent
        before he joined the group
        */
        channel_messages: [],
        //Number of messages sent in the group the user did not read
        unread_messages_number: 0
        
      }
      channelsCopy = [...channels, channel]
    }

    //Updating redux reucer with updated channels
    dispatch({ type: "UPDATE_CHANNELS", payload: channelsCopy })
  }

  /**
   * Function triggered when logged in user is removed from a group
   * @param {*} removalData - Details of group the user us removed from
   */
  const handleBeingRemovedFromGroup = (removalData) => {
    let group_id = removalData["group_id"]
    let member_id = removalData["member_id"]

    //Index of the group from which the user is removed in the list of his channels
    let groupIndex = [...channels].findIndex(ch => {

      let ch_id = "chat_id" in ch ? ch["chat_id"] : ch["group_id"]
      return ch_id === group_id
    })

    //Executed if group was not found
    if (groupIndex == -1)
      return

    //Updating user's channels
    const updatedChannels = Object.assign([], channels, {

      //Updating specific group
      [groupIndex]: {
        ...channels[groupIndex],
        //Remove user from the list of group members
        members: [...channels][groupIndex].members.filter(m => m != member_id),
        //Last activity in group, mostly the date time of the last message sent
        last_activity: removalData["remove_date"] + "",
        //Date the user is removed from the group
        remove_date: removalData["remove_date"]

      },
    })
    //Updating redux reducer with updated user's channels
    dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })

  }

  /**
   * A function triggered whenever an admin of a group closes it, meaning no message
   * can be sent anymore
   * @param {*} closeData - Details about the closure of the group, like the id of
   * the group and the date it was closed
   */
  const handleGroupClosure = (closeData) => {
    let group_id = closeData["group_id"]

    //Index of group in the list of channels
    let closedGroupIndex = [...channels].findIndex(ch => {
      if ("chat_id" in ch)
        return false
      return ch["group_id"] == group_id
    }
    )

    //Executed if group is not found
    if (closedGroupIndex == -1)
      return

    //Updating user's channels
    const updatedChannels = Object.assign([], channels, {
      //Updating the specific group
      [closedGroupIndex]: {
        ...channels[closedGroupIndex],
        //Date time of closure of group.
        close_date: closeData["close_date"]
      },
    })

    //Updating channels in redux reducer
    dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })
  }

  /**
   * Function triggered whenever the logged in user is blocked by one of his
   * private chats partners
   * @param {*} blockData - Details of blocking which are the id of the user who's
   * blocked and the one who's blocking 
   */
  const handleBeingBlocked = (blockData) => {

    //Index of private chat with the user who's blocking
    let blockingUserChatIndex = [...channels].findIndex(channel => {
      if ("group_id" in channel)
        return false;
      return channel["partner"]["_id"] === blockData["blocker_id"]
    })

    //Executed if chat was not found
    if (blockingUserChatIndex == -1)
      return

    //Update user's channels
    const updatedChannels = Object.assign([], channels, {
      //Update chat with the user that is blocking
      [blockingUserChatIndex]: {
        ...channels[blockingUserChatIndex],
        //Adding details of the blocking
        blocks_data: [...channels[blockingUserChatIndex].blocks_data,
          blockData]
      },
    })

    //Updating channels in redux reducer
    dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })
  }

    /**
   * Function triggered whenever logged in user blocking by one of his
   * private chats partners is cancelled
   * @param {*} unblockData - Details of unblocking which are the id of the user
   * who's unblocked and the one who's unblocking 
   */
  const handleBeingUnblocked = (unblockData) => {

    //Index of private chat with the user who's unblocking
    let unblockingUserChatIndex = [...channels].findIndex(channel => {
      if ("group_id" in channel)
        return false;
      return channel["partner"]["_id"] === unblockData["unblocker_id"]
    })


    //Update user's channels
    const updatedChannels = Object.assign([], channels, {
      //Update chat with the user who is unblocking
      [unblockingUserChatIndex]: {
        ...channels[unblockingUserChatIndex],
        //Removing details of blocking of logged in user
        blocks_data: [...channels[unblockingUserChatIndex].blocks_data.filter(
          block_data => block_data["blocker_id"] != unblockData["unblocker_id"]
        ),
        ]
      },
    })

    //Updating redux reducer
    dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })
  }

  /**
   * A function triggered after the user is logging in, and the connection statuses
   * of each of his private chat partners are sent to him
   * @param {*} data - Object of the connection statuses, in which each field name
   * is the id of a chat partner, and its value is the status (true when partner is
   * logged in, false otherwise )
   */
  const handleUsersConnectionsStatus = (data) => {
    /*
    Updating redux reducer by convering the object of connection statuses into a key
    value array to be later converted to a mao data structure
    */
    dispatch({ type: "UPDATE_ONLINE_USERS_STATUS", payload: Object.entries(data) })
  }

  /**
   * Triggered whenever a chat partner of the logged in user is connecting to the
   * server
   * @param {*} user_id - id of user that has just logged in
   */
  const handleNewUserLoggedIn = (user_id) => {
    //Updating redux reducer with the id of the new user who logged in
    dispatch({ type: "USER_LOGIN", payload: user_id })
  }

  /**
   * Triggered whenever a chat partner of the logged in user is disconnecting from
   * the server
   * @param {*} user_id - id of user that has just logged out
   */
  const handleUserLoggedOut = (user_id) => {
    //Updating redux reducer with the id of the new user who logged in
    dispatch({ type: "USER_LOGOUT", payload: user_id })
  }

  //Instance of socket.io library to establish websocket connection with server
  const [socket, setSocket] = useState(null);

  //A function for disconnection of user
  const disconnect = () => {
    //Disconnecting socket.io
    socket.disconnect()

    //Removing user JWT session
    usersSVR.logout()

    //Updating redux with end of connection of logged in user
    dispatch({ type: "LOGOUT" })

    //Updating redux with selected channel which is actually no channel
    dispatch({
      type: "SELECT_CHANNEL",
      payload: { id: "", index: -1 }
    })
  }

  /*
Effect for initial fetch of data of active chats ( in which at least
  one message was sent ) or groups
*/
  useEffect(() => {

    //Function to fetch channels data
    const getChannelsDataFromDB = async () => {

      //Response from server
      let response = await generalSVR.getActiveChannelsData()
      let channelsData = response.data.data

      /*
      All the user's group ids within his channels list to be later used
      with socket.io to connect to the groups in the server to be able to update
      them and receive updates from them in real time
      */
      let groupsIDs = channelsData
        .filter(channel => "group_id" in channel)
        .map(groupsData => groupsData["group_id"])

      /*
      IDs of user's private chat partners within his channels list to be later used
      with socket.io in the client and the server to check the connection
      ststuses of each of them, update the logged in user with those statuses,
      and also update them with the user connection ststus
      */
      let partnersIDs = channelsData
        .filter(channel => "partner" in channel)
        .map(chatData => chatData["partner"]["_id"])

      setGroupsIDs(groupsIDs)
      setPartnersIDs(partnersIDs)

      //Updating redux reducer with channels fetched from the server
      dispatch({ type: "UPDATE_CHANNELS", payload: channelsData })

    }
    getChannelsDataFromDB()
  }, [])


  useEffect(() => {

    /*
    A function to fetch all the logged in user uncommunicated chats - 
    private chats with contacts with whom he did not exchang a single message
    */
    const getUncommunicatedChannelsDataFromDB = async () => {
      let response = await generalSVR.getUncommunicatedContactsData()
      let uncommunicatedChannelsData = response.data.data

      //Updating redux reducer with data of uncommunicated chats
      dispatch(
        {
          type: "UPDATE_UNCOMMUNICATED_CHANNELS",
          payload: uncommunicatedChannelsData
        })
    }
    getUncommunicatedChannelsDataFromDB()
  }, [])

  useEffect(() => {

    //Establishing connection with socket.io instance
    const newSocket = io("http://" + ip + ":5000")
    setSocket(newSocket);
    return () => {
      if (socket) {
        socket.close();

      }
    }
  }, []);

  useEffect(() => {
    /*
    Updating server with group ID's of the logged in user in order to join those
    groups using socket.io in the server to receive and send updates from and to
    the server in real time
    */
    if (groupsIDs.length > 0 && socket) {
      socket.emit("join_groups", groupsIDs)
    }
  }, [groupsIDs, socket])



  useEffect(() => {

    /*
    Using logged in user private chats partners with socket.io in the server
    to update them with the logging in of the user, and to receive their connection
    status in real time
    */
    if (partnersIDs.length > 0 && socket) {
      socket.emit("add-user", {
        user_email: currUser["_id"],
        partners_ids: partnersIDs
      });
    }
  }, [partnersIDs, socket])


  useEffect(() => {
    if (socket) {

      /*
      Listner of socket.io event of receiving a message from another user
      or the same user from another session
      */
      socket.on("receive-message", (message) => {
        handleReceiveMessage(message)
      })

      /*
      Listner of socket.io event of the logged in user being added to a group
      */
      socket.on("added-to-group", (groupData) => {
        handleBeingAddedToGroup(groupData)
      })

      /*
      Listner of socket.io event of the logged in user being removed from a group
      */
      socket.on("removed-from-group", (groupData) => {
        handleBeingRemovedFromGroup(groupData)
      })

      /*
      Listner of socket.io event of the logged in user being norified one of his
      groups was closed (messages cannot be sent in it anymore) by the user
      */
      socket.on("notify-group-closure", (groupClosure) => {
        handleGroupClosure(groupClosure)
      })


      /*
      Listner of socket.io event of the logged in user being blocked by another one
      */      
      socket.on("blocked", (blockData) => {
          handleBeingBlocked(blockData)
        })

      /*
      Listner of socket.io event of the logged in user blocking by another user
      being cancelled
      */
      socket.on("unblocked", (unblockData) => {
        handleBeingUnblocked(unblockData)
      })

      /*
      Listner of socket.io event of the logged in user receiving connection
      statuses of each of his private chat partners
      */     
      socket.on("receive-users-connections-statuses", (connectionsStatusData) => {
        handleUsersConnectionsStatus(connectionsStatusData)
      })

      /*
      Listner of socket.io event of the logged in user being notified that one his
      private chats partners has just logged in
      */
      socket.on("new-user-logged-in", (user_id) => {
        handleNewUserLoggedIn(user_id)
      })

      /*
      Listner of socket.io event of the logged in user being notified that one his
      private chats partners has just logged out
      */
      socket.on("user-logged-out", (user_id) => {
        handleUserLoggedOut(user_id)
      })


    }
    return () => {
      if (socket) {

        socket.off("receive-message")
        socket.off("added-to-group")
        socket.off("removed-from-group")
        socket.off("notify-group-closure")
        socket.off("blocked")
        socket.off("unblocked")
        socket.off("receive-users-connections-statuses")
        socket.off("new-user-logged-in")
        socket.off("user-logged-out")
        socket.off("user-logged-out")

      }
    }

  }, [socket, channels, currUser, selectedChannel, partnersIDs])



  useEffect(() => {

    /*
    Using redux reducer, Updating server socket.io instance with client socket.io
    instance with the last message sent by the logged in user which
    its details have already been sent to the server through HTTP
    */
    if (socket && Object.keys(lastSentMessage).length !== 0)
      socket.emit("send-message", lastSentMessage)
  }, [lastSentMessage])

  useEffect(() => {

    /*
    Using redux reducer, Updating server socket.io instance with client
    instance with the last group created by the logged in user which
    its details have already been sent to the server through HTTP
    */
    if (socket && Object.keys(lastCreatedGroup).length !== 0)
      socket.emit("create-new-group", lastCreatedGroup)
  }, [lastCreatedGroup])

  useEffect(() => {

    /*
    Using redux reducer, Updating server socket.io instance with
    client socket.io instance with last group closed by the logged in user who is its
    admin, after this update has already been sent through HTTP.
    */
    if (socket && Object.keys(lastClosedGroup).length !== 0)
      socket.emit("close-group", lastClosedGroup)
  }, [lastClosedGroup])


  
  useEffect(() => {

    /*
    Using redux reducer, Updating server socket.io instance with
    client socket.io instance with last members added to a group by the logged in
    user who is its admin, after this update has already been sent through HTTP.
    */
    if (socket && Object.keys(lastAddedGroupMembers).length !== 0)
      socket.emit("add-new-group-members", lastAddedGroupMembers)
  }, [lastAddedGroupMembers])

  useEffect(() => {

    /*
    Using redux reducer, Updating server socket.io instance with
    client socket.io instance with last members removed from a group by the logged in
    user who is its admin, after this update has already been sent through HTTP.
    */
    if (socket && Object.keys(lastRemovedGroupMember).length !== 0)
      socket.emit("remove-group-member", lastRemovedGroupMember)
  }, [lastRemovedGroupMember])


  useEffect(() => {

    /*
    Using redux reducer, Updating server socket.io instance with
    client socket.io instance with details of last blocking by the logged in
    user of one of his private chats partners, after this update has already
    been sent through HTTP.
    */
    if (socket && Object.keys(lastUserBlock).length !== 0)
      socket.emit("block-user", lastUserBlock)
  }, [lastUserBlock])

  useEffect(() => {

    /*
    Using redux reducer, Updating server socket.io instance with
    client socket.io instance with details of last cancellation of blocking by the
    logged in user of one of his private chats partners, after this update has already
    been sent through HTTP.
    */
    if (socket && Object.keys(lastUserUnblock).length !== 0)
      socket.emit("unblock-user", lastUserUnblock)
  }, [lastUserUnblock])

  return (
    <Box display="flex" flexDirection="row" height="100vh">

      {!isNewGroupMode && !isNewChatMode &&
        /*
        Left panel of the application in which the logged in user's channels
        cards are displayed for him to select
        */
        <LeftPanel
          channels={channels}
          setNewGroupMode={setNewGroupMode}
          setNewChatMode={setNewChatMode}
          disconnect={disconnect}
        />}

      {isNewGroupMode && !isNewChatMode &&
        //A section of creating a mew group by the logged in user
        <NewGroup setNewGroupMode={setNewGroupMode} />}

      {isNewChatMode && !isNewGroupMode &&
        /*
        A section of opening a new chat window with another user, whether or not this
        chat already displays in one of the chat card in the left panel component
        */
        <NewChat setNewChatMode={setNewChatMode} />}      
        
        <Box
        sx={{
          border: ".05px solid #2f3b44",
        }}
      />
      {
      /*
      Right panel of the application in which a chat window of the selected channel
      displays
      */
      selectedChannel.index !== -1 && channels.length > selectedChannel.index &&
        <RightPanel
        />}

    </Box>
  );
}
