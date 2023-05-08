//This service is for API calls related to blocking of users by aothers
import axios from "axios";

const ip=window.location.hostname
const baseURL="http://"+ip+":5000/blocks"

/**
 * Blocking user by another user
 * @param {*} blockDetails - Details of blocking
 */
const blockUser=(blockDetails)=>
{
    return axios.post(baseURL+"/block_user",blockDetails)
}

/**
 * Unblocking a user that was previously blocked by another user
 * @param {*} unblockDetails - Unblocking details
 */
const unblockUser=(unblockDetails)=>
{
    return axios.put(baseURL+"/unblock_user",unblockDetails)
}


export default {blockUser,unblockUser}
