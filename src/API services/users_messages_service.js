
/*This service is for API calls related messages sent
 between users in chats and groups
 */
import axios from "axios";

const ip=window.location.hostname
const baseURL="http://"+ip+":5000/messages"



/**
 * Add new message to server
 * @param {*} message = The message added to the server
 */
const addMessage=(message)=>
{
    return axios.post(baseURL+"/new_message",message)
}

/**
 * Reading unread messages of a user in a chat
 * @param {*} user_id - ID of user who's reading unread messages
 * @param {*} chat_id - ID of chat in which the unread messages are read
 * @param {*} action - Action that is being taken which in this case is reading 
 * unread messages
 */
const readChatUserUnreadMessages=(user_id,chat_id,action)=>
{
    return axios.put(baseURL+"/read_chat_user_unread_messages",
        {user_id:user_id,chat_id:chat_id,action:action})
}

/**
 * Reading unread messages of a member in a group
 * @param {*} member_id - ID of member who's reading the message
 * @param {*} group_id - ID of group in which the messages were sent
 * @param {*} action - The action that is being taken which is reading unread messages
 */
const readGroupUsersUnreadMessages=(member_id,group_id,action)=>
{
    return axios.put(baseURL+"/read_group_member_unread_messages",
        {member_id:member_id,group_id:group_id,action:action})
}


export default {addMessage,
    readChatUserUnreadMessages,readGroupUsersUnreadMessages
   }

