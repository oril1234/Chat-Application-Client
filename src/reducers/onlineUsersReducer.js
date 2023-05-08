
/*
Redux reducer to store the data of all the users other than the current
one that are logged in
*/
export const onlineUsersReducer = (state = { onlineUsers :new Map()}, action) =>
{
    switch(action.type)
    {
        /*
        Update the connection status of all the users the current user has
        communication with
        */
        case "UPDATE_ONLINE_USERS_STATUS":
            return {...state, onlineUsers : new Map(action.payload)}

        //Handled when a specific user logs in
        case "USER_LOGIN":
            {
                let updatedMap=new Map(state.onlineUsers)
                updatedMap.set(action.payload,true)
                return {...state, onlineUsers :updatedMap}
            }
        
        //Handled when a specific user logs out
        case "USER_LOGOUT":
            {
                let updatedMap=new Map(state.onlineUsers)
                updatedMap.set(action.payload,false)
                return {...state, onlineUsers :updatedMap}
            }
        default:
            return state
    }
}

