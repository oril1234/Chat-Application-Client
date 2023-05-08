
//Redux reducer to store the data of logged in user
export const authReducer = (state = { loggedInUser : {}}, action) =>
{
    switch(action.type)
    {
        /*
        Handled when the user logins to the system and send its data to
        store
        */
        case "LOGIN":
            return {...state, loggedInUser : action.payload}

        //Handled when the user logs out and his data is deleted
        case "LOGOUT":
            return {...state, loggedInUser : {}}
        

        default:
            return state
    }
}

