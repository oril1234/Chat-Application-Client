import store from '../store'
import messagesSVR from '../API services/users_messages_service'
import chatsSVR from '../API services/chats_service'
import groupsSVR from '../API services/groups_service'
import blocksSVR from '../API services/users_blocks_service'

/**
 * Function triggered when the current user opens a chat window with a user
 * he hasn't exchanged messages with
 * @param {*} channels - All the channels the user has communication with
 * or group chats 
 * @param {*} uncommunicatedChannels - All private chats with users the current user
 * has no communication with
 * @param {*} chat_id - ID of uncommunicated channel 
 */
const selectUncommunicatedChannel = (channels, uncommunicatedChannels, chat_id) => {
  
  let updatedChannels = [...channels]
  let updatedUncommunicatedCahnnels = [...uncommunicatedChannels]
  //Selected uncommunicated channel index
  let selectedUncomChanIndex = updatedUncommunicatedCahnnels.findIndex(
    ch => {
      let ch_id = "chat_id" in ch ? ch["chat_id"] : ch["group_id"]
      return ch_id === chat_id
    }
  )

  //Making the selected uncommunicated channel a communicated one
  updatedChannels.push([...uncommunicatedChannels][selectedUncomChanIndex])

  //Removing selected uncommunicated channel from the list of uncommunicated channels
  updatedUncommunicatedCahnnels.splice(selectedUncomChanIndex, 1)

  //Index of the uncommunicated channel that has just become communicated one
  let selectedIndexInUpdatedChannels = updatedChannels[updatedChannels-1]

  //Update redux reducer with updated channels
  store.dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })

  //Updating redux reducer with id and index of the newly selected channel
  store.dispatch({
    type: "SELECT_CHANNEL",
    payload: { id: chat_id, index: selectedIndexInUpdatedChannels }
  })

  //Updating redux reducer with the updated uncommunicated channels
  store.dispatch({
    type: "UPDATE_UNCOMMUNICATED_CHANNELS",
    payload: updatedUncommunicatedCahnnels
  })

}

/**
 * A function to select a channel by the user. There's a differentiation between
 * 2 types of channels: 1. communicated ones which are all the group chats and
 * the private chats in which was sent at least one message 2. uncommunicated ones -
 * private chats in which no message was sent
 * @param {*} channels -Communicated channels
 * @param {*} uncommunicatedChannels - Uncommunicated channels
 * @param {*} channel - Selected channel
 * @param {*} channel_id - ID of selected channel
 */
const selectChannel = (channels, uncommunicatedChannels, channel, channel_id) => {

  //Currently selected channel id
  let previous_selected_id=store.getState().
    selectedChannelReducer.selectedChannel.id

  //Executed if newly selected channel is the same as the one selected before
  if(previous_selected_id==channel_id)
    return

  //True if selected channel is a private chat
  let isChat = "chat_id" in channel

  //Index of selected channel in communicated channels
  let currChannelIndex = channels.findIndex(
    ch => {
      let ch_id = "chat_id" in ch ? ch["chat_id"] : ch["group_id"]
      return ch_id === channel_id
    }
  )

  /*
  Executed if no index was found, and in this cae the channel is searched in
  the uncommunicated channels
  */
  if (currChannelIndex == -1) {

    selectUncommunicatedChannel(channels,
      uncommunicatedChannels, channel_id)
    return
  }

  //Updating redux redcer with data id and index of selected channel
  store.dispatch({
    type: "SELECT_CHANNEL",
    payload: { id: channel_id, index: currChannelIndex }
  })

  //Executed if selected channel has messages unread by the user
  if (channel["unread_messages_number"] > 0) {

    /*
    Reading unread messages and updating server in the case the selected channel is
    a private chat
    */
    if (isChat) {
      messagesSVR.readChatUserUnreadMessages(channel["user_id"], channel_id,
        "read all")
    }

    /*
    Reading unread messages and updating server in the case the selected channel is
    a group chat
    */
    else {

      messagesSVR.readGroupUsersUnreadMessages(channel["user_id"], channel_id,
        "read all")
    }
  }

  //The number of unread messages before selection channel
  let previousUnreadMessagesNumber =
    channels[currChannelIndex].unread_messages_number

  //Updating channels
  const updatedChannels = Object.assign([], channels, {

    //Updating selected channel
    [currChannelIndex]: {
      ...channels[currChannelIndex],
      /*
      Field used to display for the user how many messages that were not read
      by him there were before channel selection
      */
      previous_unread_messages_number: previousUnreadMessagesNumber,

      /*
      Current number of unread messages which is 0 because whenever a channel is
      selected all the unread messages are read
      */
      unread_messages_number: 0

    }
  })

  //Updating redux reducer with updated channels 
  store.dispatch({
    type: "UPDATE_CHANNELS",
    payload: updatedChannels
  })

}

/**
 * Function to delete private chat from list of user's channels
 * @param {*} channels - User's private and group chats
 * @param {*} chat_id - ID of private chat that is deleted
 * @param {*} user_id - ID of current user
 */
const deleteChat = async (channels, chat_id, user_id) => {

  try {
    //Updating private chat of channel in server
    let resp = await chatsSVR.deleteChat(chat_id, user_id)

    if (resp.status == 200) {
      //Updated channels
      const updatedChannels = [...channels].filter(ch => {
        if ("group_id" in ch)
          return true
        return ch["chat_id"] != chat_id
      })

      //Updating redux reducer with updated channels
      store.dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })

      //Updating redux reducer with selected channel id and index
      store.dispatch({
        type: "SELECT_CHANNEL", payload: { id: "", index: -1 }
      })
    }

  }
  catch (err) {
    console.log(err)

  }

}

/**
 * Function to close a group by its admin, meaning no message can be sent in it
 * anymore
 * @param {*} channels - User's private and group chats
 * @param {*} group_id - id of closed group
 * @param {*} channel_index - index of channe in the list of channels
 */
const closeGroup = async (channels, group_id, channel_index) => {

  try {
    if (channel_index == undefined)
      channel_index = channels.findIndex(
        ch => {
          if ("chat_id" in ch)
            return false
          return ch["group_id"] === group_id
        }
      )

    //Details of closure of group
    let closureData = {
      group_id: group_id,
      close_date: new Date()
    }

    //Updating server with closure of group
    let resp = await groupsSVR.closeGroup(closureData)

    //Executed if message added properly
    if (resp.status === 200) {

      //Updated channels
      const updatedChannels = Object.assign([], channels, {
        //Index of group that is closed
        [channel_index]: {
          ...channels[channel_index],
          //Date time in which the group was closed
          close_date: closureData["close_date"]
        },
      })

      //Updating redux reducer with updated channels
      store.dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })
      
      /*
      Updating redux reducer with details of last group that was closed, in order
      to inform its members un real time using instances of socket.io instances in
      the client and the server
      */
      store.dispatch({
        type: "UPDATE_LAST_CLOSED_GROUP",
        payload: closureData
      })

    }
  } catch (err) {
    console.log(err)
  }
}

/**
 * Function to delete group chat from list of user's channels
 * @param {*} channels - User's private and group chats
 * @param {*} chat_id - ID of group chat that is deleted
 * @param {*} user_id - ID of current user
 */
const deleteGroup = async (channels, group_id, user_id) => {

  try {

    /*
    Updating deletion of group for ex member in server after he's previously
    left it either by himself or by being removed by group admin
    */
    let resp = await groupsSVR.deleteGroupMember(group_id, user_id)

    if (resp.status == 200) {

      //Updated channels
      const updatedChannels = [...channels].filter(ch => {
        if ("chat_id" in ch)
          return true

        return ch["group_id"] != group_id
      })

      //Updating redux reducer with updated channels
      store.dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })

      //Updating redux reducer with id and index of deleted group
      store.dispatch({
        type: "SELECT_CHANNEL", payload: { id: "", index: -1 }
      })
    }

  }
  catch (err) {
    console.log(err)

  }

}

/**
 * Function for the user to self leave a group
 * @param {*} channels - Private and group chats of the user
 * @param {*} group_id - ID of group thaty is being left
 * @param {*} user_id - ID of current user
 * @param {*} group_index - Index of group in the list of channels
 */
const exitGroup = async (channels, group_id, user_id, group_index) => {

  try {

    //Date time in which the user leaves the group
    let exitDate = new Date()

    //Update server with the user leaving the group
    let resp = await groupsSVR.selfExitFromGroup(
      group_id, user_id, exitDate)

    if (group_index == undefined)
      group_index = channels.findIndex(
        ch => {
          if ("chat_id" in ch)
            return false
          return ch["group_id"] === group_id
        }
      )

    if (resp.status === 200) {

      //Updated channels
      const updatedChannels = Object.assign([], channels, {
        //Updating group that is being left
        [group_index]: {
          ...channels[group_index],
          //Date of leaving the group
          exit_date: exitDate
        },
      })

      //Updating redux reducer with updated channels
      store.dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })

      //Updating redux reducer with id and index of the selected channel
      store.dispatch({
        type: "SELECT_CHANNEL",
        payload: { id: "", index: -1 }
      })

    }
  } catch (err) {
    console.log(err)
  }
}

/**
 * Function for the user to block another one
 * @param {*} channels - Private and group chats of the user
 * @param {*} chat_id - Private chat id in which the chat partner is being blocked
 * @param {*} blocker_id - ID of current user who is blocking his chat partner
 * @param {*} blocked_id - ID of chat partner that is being blocked
 * @param {*} chat_index - index of private chat in the user's channels list
 */
const blockUser = async (channels, chat_id, blocker_id,
  blocked_id, chat_index) => {
  try {

    //Blocking details
    let blockData = {
      blocker_id: blocker_id,
      blocked_id: blocked_id
    }

    //Updating server with blocking details
    let resp = await blocksSVR.blockUser(blockData)

    if (chat_index == undefined)
      chat_index = channels.findIndex(
        ch => {
          if ("group_id" in ch)
            return false
          return ch["chat_id"] === chat_id
        }
      )

    //Executed if message added properly
    if (resp.status === 200) {

      //Updated channels
      const updatedChannels = Object.assign([], channels, {

        //Updating the private chat in which the chat partner is blocked
        [chat_index]: {
          ...channels[chat_index],
          blocks_data: [...channels[chat_index].blocks_data,
            blockData],
        },
      })

      /*
      Updating redux reducer with blocking deta in order to inform the 
      the chat partner in real time using instances of socket.io in client
      and server
      */
      store.dispatch({
        type: "UPDATE_LAST_USER_BLOCK_DETAILS",
        payload: blockData
      })

      //Updating redux reducer with updated channels
      store.dispatch({
        type: "UPDATE_CHANNELS",
        payload: updatedChannels
      })


    }
  } catch (err) {
    console.log(err)
  }

}

/**
 * Function for cancellig blocking of chat partner of the logged in user
 * @param {*} channels - Users private and group chats
 * @param {*} chat_id - ID of the private chat in which the chat partner blocking
 * is cancelled
 * @param {*} unblocker_id - Current user id who's unblocking his chat partner
 * @param {*} unblocked_id - ID of chat partner who's being unblocked
 * @param {*} chat_index - Index of private chat in channels list
 */
const unblockUser = async (channels, chat_id, unblocker_id,
  unblocked_id, chat_index) => {
  try {

    //Data of unblocking
    let unblockData = {
      unblocked_id: unblocked_id,
      unblocker_id: unblocker_id
    }

    if (chat_index == undefined)
      chat_index = channels.findIndex(
        ch => {
          if ("group_id" in ch)
            return false
          return ch["chat_id"] === chat_id
        }
      )

    //Updating server with unblocking details
    let resp = await blocksSVR.unblockUser(unblockData)

    //Executed if message added properly
    if (resp.status === 200) {

      //updating channels
      const updatedChannels = Object.assign([], channels, {

        //update private chat in which the chat partner is being unblocked
        [chat_index]: {
          ...channels[chat_index],
          blocks_data: [...channels[chat_index].blocks_data.filter(
            block_data => block_data["blocker_id"] != unblocker_id
          ),
          ]
        },
      })

      /*
      Updating redux reducer with unblocking deta in order to inform the 
      the chat partner in real time using instances of socket.io in client
      and server
      */
      store.dispatch({
        type: "UPDATE_LAST_USER_UNBLOCK_DETAILS",
        payload: unblockData
      })

      //Updating redux reducer with updated channels
      store.dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })


    }
  } catch (err) {
    console.log(err)
  }

}



export default {
  selectChannel, selectUncommunicatedChannel, deleteChat,
  deleteGroup, exitGroup, closeGroup, blockUser, unblockUser
}