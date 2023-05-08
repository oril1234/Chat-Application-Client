//This service is for API calls related to chats between 2 users
import axios from "axios";

const ip=window.location.hostname
const baseURL="http://"+ip+":5000/chats"


/**
 * Delete user from chat, meaning the chat will still exist
 * but the user won't see it
 * @param {*} chat_id - ID of chat that is deleted
 * @param {*} user_id - ID of user who deletes chat
 * @returns 
 */
const deleteChat=(chat_id,user_id)=>
{
    return axios.delete(baseURL+"/delete_user_from_chat/"+
        chat_id+"/"+user_id)
}



export default {deleteChat}
