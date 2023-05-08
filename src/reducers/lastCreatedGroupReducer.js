/*
Redux reducer to store the last group that was created
*/ 
export const lastCreatedGroupReducer =
     (state = { group: {}}, action) => {
    
  switch(action.type)
  {
      //Loading data of last created group
      case "UPDATE_LAST_CREATED_GROUP" :
          return { ...state, group :action.payload}

      default:
          return {...state};
        }
}