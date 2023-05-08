/*
Redux reducer to store the last group that was closed 
*/ 
export const lastClosedGroupReducer =
     (state = { closure_data:{}}, action) => {
    
  switch(action.type)
  {

      //Loading data of closure of last group
      case "UPDATE_LAST_CLOSED_GROUP" :
          return { ...state, closure_data :action.payload}

      default:
          return {...state};
        }
}