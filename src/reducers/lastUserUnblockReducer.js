/*
Redux reducer to store the last user unblock details. including the id
of the unblocked user and the id of the user that unblocks
*/ 
export const lastUserUnblockReducer =
     (state = { unblock_details: {}}, action) => {
    
  switch(action.type)
  {
      //Loading details of last blocking what was cancelled by the user
      case "UPDATE_LAST_USER_UNBLOCK_DETAILS" :
          return { ...state, unblock_details :action.payload}

      default:
          return {...state};
        }
}