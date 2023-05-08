
//This service is for API calls of general actions and internal use of the
//client 
import axios from "axios";


const ip=window.location.hostname
const baseURL="http://"+ip+":5000/general"


/*
Fetch all the data related to active chats the user participates in
*/ 
const getActiveChannelsData=()=>
{
    return axios.get(baseURL)
}

/*
Fetch all the data related to contacts with which the current user has not
exchange messages within chats yet
*/ 
const getUncommunicatedContactsData=()=>
{
    return axios.get(baseURL+"/uncommunicated_contacts")
}



export default {getActiveChannelsData,getUncommunicatedContactsData}

