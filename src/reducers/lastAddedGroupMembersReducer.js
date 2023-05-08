/*
Redux reducer to store the id's of the last users added to a group as members
by the the current user who is its admin and the id of the group
*/ 
export const lastAddedGroupMembersReducer =
     (state = { addedMembersData: {}}, action) => {
    
  switch(action.type)
  {
      //Loading data of members along with the id of the group
      case "UPDATE_LAST_ADDED_GROUP_MEMBERS" :
          return { ...state, addedMembersData :action.payload}

      default:
          return {...state};
        }
}