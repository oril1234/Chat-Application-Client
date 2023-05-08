/*
Redux reducer to store the ID of the currenty selected channel (chat or
group ) and its index in the array of user's channels
*/ 
export const selectedChannelReducer =
     (state = { selectedChannel:{id:"",index:-1}}, action) => {
    
  switch(action.type)
  {

      //Updating te id and index of selected channel
      case "SELECT_CHANNEL" :
          return { ...state, selectedChannel :action.payload}


      default:
          return {...state};
        }
}