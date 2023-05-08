/*This service is for API calls related to groups of
 users who chat with each other
 */
import axios from "axios";

const ip=window.location.hostname
const baseURL="http://"+ip+":5000/groups"

/**
 * Add new group to server
 * @param {*} group - Group that is added to server
 */
const addGroup=(group)=>
{
    return axios.post(baseURL+"/new_group",group)
}

/**
 * Add groups that are mutual between 2 users
 * @param {*} id1 - ID of first user
 * @param {*} id2 - ID of second user
 * @ 
 */
const getUsersSharedGroups=(id1,id2)=>
{
    return axios.get(baseURL+"/shared_groups/"+id1+"/"+id2)
}

/**
 * Closing group, meaning no messages can be sent in it anymore
 * @param {*} close_data - Details of group closure
 */
const closeGroup=(close_data)=>
{
    return axios.put(baseURL+"/close_group",close_data)
}

/**
 * Delete completely membership of a user in a group after 
 * he has already exited or been removed beforehand
 * @param {*} group_id - id of group deleted for the member
 * @param {*} member_id - Member ID for which grou is deleted
 */
const deleteGroupMember=(group_id,member_id)=>
{
    return axios.delete(baseURL+"/self_delete_member_from_group/"
    +group_id+"/"+member_id)
}

/**
 * Add new menbers to group 
 * @param {*} groupId - ID of group to which members are added
 * @param {*} members - The members that are added
 */
const addGroupMenbers=(groupId, members)=>
{
    return axios.put(baseURL+"/new_group_members/"+groupId,members)
}

/**
 * Stop membership of a user in a group
 * @param {*} groupId - ID of group from which the member is removed
 * @param {*} memberId - ID of member who's being removed
 * @param {*} removeDate - Date in which the removal happens
 */
const removeGroupMember=(groupId, memberId,removeDate)=>
{
    return axios.put(baseURL+"/remove_member_from_group/"+
        groupId+"/"+memberId,removeDate)
}

/**
 * Triggered when a user exits a group by himself
 * @param {*} groupId - ID of group that is exited
 * @param {*} memberId - ID of members who's exiting the group
 * @param {*} exitDate - The date in which the group is exited
 * @returns 
 */
const selfExitFromGroup=(groupId, memberId,exitDate)=>
{
    return axios.put(baseURL+"/group_member_exit/"+
        groupId+"/"+memberId,exitDate)
}


export default {addGroup,getUsersSharedGroups,
    closeGroup,deleteGroupMember,addGroupMenbers,removeGroupMember,selfExitFromGroup}
