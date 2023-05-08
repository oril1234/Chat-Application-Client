/*
Redux reducer to store the data of all the chats with users
the current user has no communication with (Meaning no message
has been exchanged between them)
*/ 
export const uncommunicatedChannelsReducer =
     (state = { channels: []}, action) => {
    
  switch(action.type)
  {
      //Loading data of user's uncommunicated channels
      case "UPDATE_UNCOMMUNICATED_CHANNELS" :
          return { ...state, channels :action.payload}


      default:
          return {...state};
        }
}