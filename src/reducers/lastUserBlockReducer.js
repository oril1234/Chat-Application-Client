/*
Redux reducer to store the last user blocking details. including the id
of the blocked user and the id of the chat
*/ 
export const lastUserBlockReducer =
     (state = { block_details: {}}, action) => {
    
  switch(action.type)
  {
      //Loading details of last blocking done by the user
      case "UPDATE_LAST_USER_BLOCK_DETAILS" :
          return { ...state, block_details :action.payload}

      default:
          return {...state};
        }
}