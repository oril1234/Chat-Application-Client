
//This service is for API calls related to users
import axios from "axios";

const ip=window.location.hostname
const baseURL="http://"+ip+":5000/users"


//Fetch all the users from server
const getUsers=()=>
{
    return axios.get(baseURL)
}

/**
 * Function to login to system
 * @param {*} credentials - Username and password
 */
const login=(credentials)=>
{
    return axios.post(baseURL+"/login",credentials)
}

//Function to fetch data of user that logged in
const get_logged_in_user_data=()=>
{
    return axios.get(baseURL+"/logged_in_user")
}

/**
 * Function to sign up and create a new account
 * @param {*} credentials - User name and password
 */
const signup=(credentials)=>
{
    return axios.post(baseURL+"/signup",credentials)
}


/**
 * Function to store JWT in session storage after user logged in successfully
 * @param {*} token - JWT that is stored
 */
const saveToken=(token)=>
{
    sessionStorage["token"]=token
}

//Get JWT 
const getToken=()=>
{
    return sessionStorage["token"]
}

//logout of user from system by deleting JWT
const logout=()=>
{
    sessionStorage.removeItem("token")
}


export default {getUsers,login,get_logged_in_user_data,
    signup,saveToken,getToken,logout}

