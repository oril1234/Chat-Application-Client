import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import usersSvr from "../API services/users_service";
import { Box} from '@mui/material';
import AuthWrapper from './Auth/Auth_Wrapper';
import Homepage from './Basic Components/Homepage';



/*
Main component of the app in which routing between differenet 
is executed based on the state of the user ( logged in or not)
*/
export default function MainPage(props) {

    //Deta of logged in user - exists if the user is logged in
    const authReducerData = useSelector(state => state.authReducer)


    //Hook to update redux with data fetched from server
    const dispatch = useDispatch()


    useEffect(() => {

        //Function to fetch user's details 
        async function fetch_logged_in_user_data() {
            //Fetching user's details from server
            let resp = await usersSvr.get_logged_in_user_data()
            //Updating redux reducer with user's details
            dispatch({ type: "LOGIN", payload: resp.data.user })

        }

        /*
        Executed if user still has JWT, but he refreshed the page and has to refetch
        his details from server
        */
        if(sessionStorage['token'] &&
             Object.keys(authReducerData.loggedInUser).length == 0)
             {
                fetch_logged_in_user_data()
             }

    }, []

    )

    return (
        <Box>
           { Object.keys(authReducerData.loggedInUser).length != 0?
           //Application homepage displayed when current user is logged in
           <Homepage />:
           //Login page( from which user can route to sign up page)
           <AuthWrapper/>
           }
        </Box>
            
        
    )
}