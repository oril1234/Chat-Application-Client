/*
Redux reducer to store the details of the last member to be
removed from a group
*/ 
export const lastRemovedGroupMemberReducer =
     (state = { removedMemberData: {}}, action) => {
    
  switch(action.type)
  {
      //Loading detail of last removal of group members
      case "UPDATE_LAST_REMOVED_GROUP_MEMBER" :
          return { ...state, removedMemberData :action.payload}

      default:
          return {...state};
        }
}