/*
Redux reducer to store the data of all the channels (private chats and group chats)
the user is part of
*/ 
export const channelsReducer =
     (state = { channels: []}, action) => {
    
  switch(action.type)
  {
    
      //Loading all of the logged in user's channels
      case "UPDATE_CHANNELS" :
          return { ...state, channels :action.payload}


      default:
          return {...state};
        }
}