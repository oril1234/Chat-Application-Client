import { Avatar, Box, Grid, Input, Typography } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from "react";
import ContactToAddToGroup 
  from "../ContactToAddToGroup/ContactToAddToGroup";
import { Chip, Stack } from '@mui/material';
import usersSVR from "../../../API services/users_service";
import groupsSVR from "../../../API services/groups_service"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { v4 } from 'uuid'

/**
 * Section of a form for creating a new group and adding members
 * to it
 * @param {*} setNewGroupMode - This function determines if the component
 * displays. When triggered with the argument of false the component
 * disappears
 */
export default function NewGroup({ setNewGroupMode }) {

  /*
  If true the current stage of the form is the first one in which
  the group members are selected
  */
  const [isFormFirstStage, setFormFirstStage] = useState(true)

  /*
  Whenevet a contact is selected as a future member of the new group,
  his name is visually added as a Chip Material UI component to a Stack
  container. this variable is the height of the stack, and whenever
  it is above a specific value the bottom of the stack is the part
  that is viewed
  */
  const [height, setHeight] = useState(0)

  /*
  A ref hook of div that wraps the stack
  */
  const inputRef = useRef(null)

  /*
  A ref hook to use as a point of reference to scroll the view of
  the stack to whenever the height of the stack is above a specific heigh
  */
  const addedUserRef = useRef(null)

  /*
  Contacts Selected by the user in order to be later added to the
  new group
  */
  const [addedContacts, setAddedContacts] = useState([])

  /*
  Contacts from which the user can select in order to add them to the 
  new group
  */
  const [contactsToSelect, setContactsToSelect] = useState([])

  //Logged in user
  const currUser = useSelector(state => state.authReducer).loggedInUser

  //Channels (private and group chats) of the logged in user
  const channels = useSelector(state => state.channelsReducer).channels
  
  //Hook to update redux reducer
  const dispatch = useDispatch()

  /*
  Name of a contact the user enters as an input to filter the list of
  the contacts to select as group members
  */
  const [contactNameSearchQuery, setContactNameSearchQuery] = useState("")
  
  //Name picked by the user to the new group
  const [newGroupName, setNewGroupName] = useState("")

  /*
  Fetching all the contacts of the user in order select among them
  the members of his new group
  */
  useEffect(() => {
    const getContactsFromDB = async () => {
      let response = await usersSVR.getUsers()
      let contactsData = response.data
      console.log(contactsData)
      setContactsToSelect(contactsData)
    }
    getContactsFromDB()

  }, [])



  useEffect(() => {

    /*
    Set the variable of height when stack is above a certain height
    */
    if (inputRef.current && inputRef.current.clientHeight) {
      if (inputRef.current.clientHeight > 160)
        setHeight(inputRef.current.clientHeight)

    }
  })

  /*
  Scroll the view to a point of reference positioned at the bottom
  of the stack
  */
  useEffect(() => {
    if (height >= 180) {
      addedUserRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    }
  }, [height, addedContacts])

  /**
   * Function to add a contact to the list of the future members
   * of the new group
   * @param {*} newContactToGroup - Object of the contact that is added
   */
  const handleSelectContact = (newContactToGroup) => {
    //Resetting the input of the contact name
    setContactNameSearchQuery("")


    let addedContactsCopy = [...addedContacts]
    let contactsToSelectCopy = [...contactsToSelect]

    /*
    Add the contact to the list of contacts that were selected as the 
    future members of the new group, and removing him from the list of 
    contacts the logged in user can select from as members
    */
    addedContactsCopy.push(newContactToGroup)
    contactsToSelectCopy = contactsToSelectCopy.filter(
      contact => contact["_id"] !== newContactToGroup["_id"])
    
    setAddedContacts(addedContactsCopy)
    setContactsToSelect(contactsToSelectCopy)
  }

  /**
   * Function to unselect a contact that was previously selected as 
   * a member of the new group
   * @param {*} contactToRemoveFromGroup - Object of the contact who's
   * unselected
   */
  const handleUnselectContact = (contactToRemoveFromGroup) => {
    let addedContactsCopy = [...addedContacts]
    let contactsToSelectCopy = [...contactsToSelect]

    /*
    Unselecting a contact from the list of selected contacts
    who are intended to be the new group members, and adding it
    back to the list of user from which the logged in user can select to
    add to group
    */
    addedContactsCopy = addedContactsCopy.filter(
      contact => contact["_id"] !== contactToRemoveFromGroup["_id"])
    contactsToSelectCopy.push(contactToRemoveFromGroup)

    setAddedContacts(addedContactsCopy)
    setContactsToSelect(contactsToSelectCopy)
  }

  /*
  Function to finally create the group, by sending it to the server 
  along with its members 
  */
  const createNewGroup = async () => {

    //Object of the new group
    let newGroupData = {
      group_id: v4(), group_name: newGroupName,
      members: [currUser, ...addedContacts], creator: currUser["_id"],
      last_activity: new Date()
    }

    try {

      //Adding group to server
      let resp = await groupsSVR.addGroup(newGroupData)

      //Executed if addition succeeded
      if (resp.status === 200) {

        /*
        A new channel with the group details in order to add it to
        the list of the user's channels
        */
        let newChannel = {
          user_id: newGroupData["creator"], group_id: newGroupData["group_id"],
          group_name: newGroupData["group_name"],
          creator: newGroupData["creator"],
          last_activity: newGroupData["last_activity"],
          channel_messages: [], members: newGroupData["members"]
        }

        /*
        ndex of the new channel which is the last one in the list 
        of channels
        */
        let new_channel_index = channels.length

        /*
        Updating redux reducer withe the updated channels including the
        new channel
        */
        dispatch({ type: "UPDATE_CHANNELS", payload: [...channels, newChannel] })
        
        /*
        Updating the new channel to be the selected channel by the logged
        in user
        */
        dispatch({
          type: "SELECT_CHANNEL",
          payload: { id: newGroupData["_id"], index: new_channel_index }
        })

        /*
        Updating redux with details of the group so socket.io library
        instance in the application will be triggered in order 
        notify the newly added group members in real time they were added 
        to the group
        */
        dispatch({
          type: "UPDATE_LAST_CREATED_GROUP",
          payload: newGroupData
        })

        //Deleting the component and returning to prevoious page
        setNewGroupMode(false)
      }

    }
    catch (err) {
      console.log(err)

    }

  }

  return (
    <Box
      mxaxHeight="100%"
      width="30%"

      pt={3}
    >
      <Box
        sx={{
          background: "#101b20",
          padding: "12px",
        }}

      >
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
        >
          {
            //When this button is clicked the whole component disappears
            <Avatar
              style={{
                cursor: 'pointer',
                color: 'white', background: 'transparent',
                fontWeight: 'bold', marginRight: '10%'
              }}
              onClick={() => setNewGroupMode(false)}>
              <ArrowBackIcon />
            </Avatar>
          }
          <Typography>
            {isFormFirstStage ? 'Add Group Participants' : 'New Group'}
          </Typography>

        </Box>
        {
          /*
          A segment displayed at the first stage of the form,
          when the user just selects the group members
          */
          isFormFirstStage &&
          <Box

            sx={{
              background: "#1f2c33",
              borderRadius: "8px",
              padding: "0px 8px",
              overflow: "auto",
              maxHeight: '200px'

            }}
            flex={1}
            alignItems="center"
            ref={inputRef}
          >

            {
              /*
              A stack containing the names of the contacts
              the user has selected as the future members of his
              new group
              */
              <Stack direction="row" spacing={1}
                style={{
                  display: 'inline-block', float: 'left',
                  clear: 'both'
                }}>
                {
                  addedContacts.map(contact => {
                    return <Chip label={contact["username"]}
                      onDelete={() => { handleUnselectContact(contact) }} />
                  }

                  )
                }
              </Stack>
            }

            { //Used as a point of reference to scroll the view to
              <div className="message sent"
                style={{ backgroundColor: 'transparent' }} ref={addedUserRef}>
              </div>
            }
          </Box>
        }
        {
        
        isFormFirstStage ?
          /*
          Input field in which the user types a name of one of his
          contacts to add him to his new group.
          */
          <Input
            fullWidth
            disableUnderline
            placeholder="Type contact name"
            value={contactNameSearchQuery}
            onChange={(e) => setContactNameSearchQuery(e.target.value)}
            sx={{
              height: "35px",
              color: "white",
              padding: "0px 13px",
              fontSize: "14px",
            }}

          /*
          Input field displayed to the user when the form is at its
          second stage when members were already added to the new group
          and the name of the group still has to be selected
          */
          /> :
          <Input
            fullWidth
            disableUnderline
            placeholder="Choose group name"
            sx={{
              height: "35px",
              color: "white",
              padding: "0px 13px",
              fontSize: "14px",
            }}
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}

          />
        }

      </Box>
      {

          /*
          The part in which the list of contacts the user can select
          from in order to add to new group is displayed
          */
          isFormFirstStage && 
          <Box
            overflow="auto"
            height="40%"
            sx={{
              background: "#101b20",
            }}
          >
            {contactsToSelect !== undefined &&
              contactsToSelect.filter(filtered => {
                return filtered["_id"] !== currUser["_id"] &&
                  filtered["username"].toLowerCase()
                    .startsWith(contactNameSearchQuery.toLowerCase())

              }).map((contact) => {
                return (
                  //Component to display a contact the user can select
                  <ContactToAddToGroup
                    contact={contact}

                    key={contact["_id"]}
                    handleSelectContact={handleSelectContact}
                  />)
              })}
            <Box pt="50px" />

          </Box>
      }
      {
          /*
          The button to click i order to move to the next stage of
          the form in which the name of the new group is selected 
          */
          isFormFirstStage 
          && 
          <Grid align='center'>
            <Avatar onClick={() => setFormFirstStage(false)}>
              <ArrowForwardIcon
                style={{ cursor: 'pointer' }} />
            </Avatar>

          </Grid>
      }

      {
          /*
          Button to click in order to submit the form and add it,
          along with its new members to the server
          */
          newGroupName !== "" && 
          <Grid align='center'>
            <Avatar onClick={() => createNewGroup()}>
              <CheckIcon
                style={{ cursor: 'pointer' }} />
            </Avatar>

          </Grid>
      }

    </Box>
  );
}
