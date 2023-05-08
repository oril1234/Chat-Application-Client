/*
Redux reducer to store the last message sent by the current user
in any of the channels (chat or group)
*/ 
export const lastSentMessageReducer =
     (state = { message: {}}, action) => {
    
  switch(action.type)
  {
      //Loading details of last message sent by the user
      case "UPDATE_LAST_SENT_MESSAGE" :
          return { ...state, message :action.payload}

      default:
          return {...state};
        }
}