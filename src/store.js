import { createStore, combineReducers} from 'redux'
import { authReducer } from './reducers/authReducer'
import {composeWithDevTools} from 'redux-devtools-extension'
import { channelsReducer } from './reducers/channelsReducer'
import {selectedChannelReducer  } from './reducers/selectedChannelReducer'
import { lastSentMessageReducer } from './reducers/lastSentMessageReducer'
import { lastCreatedGroupReducer } from './reducers/lastCreatedGroupReducer'
import {lastAddedGroupMembersReducer  } from './reducers/lastAddedGroupMembersReducer'
import { lastUserBlockReducer } from './reducers/lastUserBlockReducer'
import { lastUserUnblockReducer } from './reducers/lastUserUnblockReducer'
import { uncommunicatedChannelsReducer } 
  from './reducers/uncommunicatedChannelsReducer'
import { onlineUsersReducer } from './reducers/onlineUsersReducer'
import {lastRemovedGroupMemberReducer } 
from './reducers/lastRemovedGroupMemberReducer'
import {lastClosedGroupReducer} from './reducers/lastClosedGroupReducer'



const rootReducer = combineReducers({
  authReducer: authReducer,
  channelsReducer:channelsReducer,
  selectedChannelReducer:selectedChannelReducer,
  lastSentMessageReducer:lastSentMessageReducer,
  lastCreatedGroupReducer:lastCreatedGroupReducer,
  lastUserBlockReducer:lastUserBlockReducer,
  lastUserUnblockReducer:lastUserUnblockReducer,
  uncommunicatedChannelsReducer:uncommunicatedChannelsReducer,
  onlineUsersReducer:onlineUsersReducer,
  lastAddedGroupMembersReducer:lastAddedGroupMembersReducer,
  lastRemovedGroupMemberReducer:lastRemovedGroupMemberReducer,
  lastClosedGroupReducer:lastClosedGroupReducer

})

const initialState = {}


const store = createStore(
  rootReducer,
  composeWithDevTools()
)

export default store
