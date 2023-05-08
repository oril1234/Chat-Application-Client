import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Avatar, Box, Chip, Grid, IconButton, Input, Stack } from '@mui/material';
import ContactToAddToGroup from '../../ContactToAddToGroup/ContactToAddToGroup';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import usersSVR from "../../../../API services/users_service";
import groupsSVR from '../../../../API services/groups_service';

/**
 * Pop up component of a list of contacts to add as members to 
 * a group
 * @param {*} setNewMembersMode - Function that when triggered with
 * the argument of false the pop up component disappears
 * @param {*} group - The group to which the contacts in this
 * component will be added
 */
export default function NewMembers({ setNewMembersMode, group }) {

    //The members that are currently in the group
    const currentGroupMembers = group["members"]

    //When true the pop up displays
    const [open] = useState(true);

    //Contacts the admin selected in order to later add to the group
    const [addedContacts, setAddedContacts] = useState([])

    /*
    Contacts from which the admin can select to add to the group.
    Whenever the user selects one of them he's removed from this array
    and added to the previous one (addedContacts) and the other way
    aeound: Whenever the admin unselects a member, it is removed from
    addedContacts and added back to contactsToSelect
    */
    const [contactsToSelect, setContactsToSelect] = useState([])

    //Logged in user
    const currUser = useSelector(state => state.authReducer).loggedInUser

    //Channels (private and group chats) of the user
    const channels = useSelector(state => state.channelsReducer).channels

    //id and index of channel the logged in user selected
    const selectedChannel = useSelector(state =>
        state.selectedChannelReducer).selectedChannel

    /*
    Variable to store the search query of a contact name the admin 
    types
    */
    const [contactNameSearchQuery, setContactNameSearchQuery] = useState("")

    //Hook to update redux reducer
    const dispatch = useDispatch()

    useEffect(() => {

        //Get all the contacts of the user from data base
        const getContactsFromDB = async () => {
            let response = await usersSVR.getUsers()
            let contactsFromDB = response.data

            /*
            Making sure the contacts the user can add as group members
            aren't already in the group
            */
            let filteredContacts = contactsFromDB.filter(c => {
                return !currentGroupMembers.map(c1 => c1["_id"]).includes(c["_id"])
            })

            //Update the contacts the admin can select
            setContactsToSelect(filteredContacts)
        }
        getContactsFromDB()

    }, [])

    /**
     * Unselect contacts from the array of contacts that are supposed
     * to be added to group
     * @param {*} contact_to_remove - Object of the contact that
     * is being removed
     */
    const handleUnselectContact = (contact_to_remove) => {

        /*
        List of contacts that were already prepared to be added as group
        members
        */
        let addedContactsCopy = [...addedContacts]

        /*
        List of all the contacts left to be added to group
        */
        let contactsToSelectCopy = [...contactsToSelect]

        /*
        Unselect contact from the list of the future group 
        members by the group admin
        */
        addedContactsCopy = addedContactsCopy.filter(
            contact => contact["_id"] !== contact_to_remove["_id"])

        /*
         Adding back the contact to the list of contacts
        the admin can select from in order to add to group
         */
        contactsToSelectCopy.push(contact_to_remove)

        setAddedContacts(addedContactsCopy)
        setContactsToSelect(contactsToSelectCopy)
    }

    /**
     * Function to handle selection of a contact in order to later
     * add him to group
     * @param {*} newContactToGroup - Object of a member to be added
     * to group
     */
    const handleAddContactToGroup = (newContactToGroup) => {
        //Resetting search query of a contact
        setContactNameSearchQuery("")


        /*
        List of contacts that were already prepared to be added as group
        members
        */
        let addedContactsCopy = [...addedContacts]

        /*
        List of all the contacts left to be added to group
        */
        let contactsToSelectCopy = [...contactsToSelect]

        /*
        Adding contact to a list of contacts that will later be added
        to group
        */
        addedContactsCopy.push(newContactToGroup)

        /*
        Filter out contact from the list of contacts from which the
        admin can select in order to add to group.
        */
        contactsToSelectCopy = contactsToSelectCopy.filter(
            contact => contact["_id"] !== newContactToGroup["_id"])
        setAddedContacts(addedContactsCopy)
        setContactsToSelect(contactsToSelectCopy)
    }

    //Triggered when closing the pop up
    const handleClose = (event, reason) => {
        if (reason && reason === "backdropClick")
            return
        setNewMembersMode(false)

    };

    //Final confirmation of adding members to group
    const confirmAddNewMembersToGroup = async () => {

        try {

            //Adding message to server
            let resp = await groupsSVR.addGroupMenbers(group["group_id"],
                addedContacts)

            //Executed if message added properly
            if (resp.status === 200) {

                const updatedChannels = Object.assign([], channels, {
                    [selectedChannel.index]: {
                        ...group,
                        last_activity: new Date() + "",
                        members: [...channels[selectedChannel.index].members,
                        ...addedContacts]
                    },
                })

                //Update user's updated channel
                dispatch({ type: "UPDATE_CHANNELS", payload: updatedChannels })

                /*
                Adding members to redux reducer so socket io library
                wo;; be triggered to update the members themselves in
                real time they were added to group
                */
                dispatch({
                    type: "UPDATE_LAST_ADDED_GROUP_MEMBERS",
                    payload: { group_data: group, members: addedContacts }
                })

            }
        } catch (err) {
            console.log(err)
        }
        setNewMembersMode(false)

    }

    return (
        <Box>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth
                height="900px"


            >
                <DialogTitle

                    style={{ paddingBottom: 0, height: "80px" }}
                    id="alert-dialog-title">
                    <Grid container >
                        <Grid item sm={8}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center">
                                <IconButton
                                    onClick={() => handleClose()}
                                    sx={{
                                        paddingRight: "10px",
                                    }}
                                >
                                    <CloseIcon
                                        sx={{
                                            color: "#afbac0",
                                        }}
                                    />
                                </IconButton>
                                <h3>Add Members</h3>
                            </Box>
                        </Grid>

                    </Grid>


                </DialogTitle>
                <DialogContent>
                    <Box
                        mxaxHeight="100%"
                        width="100%"

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



                            </Box>
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
                            >

                                <Stack direction="row" spacing={1}
                                    style={{ display: 'inline-block', float: 'left', clear: 'both' }}>
                                    {
                                        /*
                                        List of contacts selected to
                                        be later added to group
                                        */
                                        addedContacts.map(contact => {
                                            return <Chip label={contact["username"]} onDelete={() => {
                                                handleUnselectContact(contact)
                                            }} />
                                        }

                                        )
                                    }
                                </Stack>

                            </Box>

                            {

                                //Input of search query of a contact
                                <Input
                                    fullWidth
                                    disableUnderline
                                    placeholder="Type contact name"
                                    value={contactNameSearchQuery}
                                    onChange={(e) =>
                                        setContactNameSearchQuery(e.target.value)}
                                    sx={{
                                        height: "35px",
                                        color: "white",
                                        padding: "0px 13px",
                                        fontSize: "14px",
                                    }}

                                />}

                        </Box>
                        <Box
                            overflow="auto"
                            height="200px"
                            sx={{
                                background: "#101b20",
                            }}
                        >
                            {
                                /*
                                Displaying contacts the user still did not
                                select from to add to group
                                */
                                contactsToSelect !== undefined &&
                                contactsToSelect.filter(filtered => {
                                    /*
                                    Function to filter chats according
                                    to search query entered as an input
                                    */
                                    const checkStartsWith = (full_string) => {
                                        let strArr =
                                            full_string.replace(/\s+/g, ' ').trim().split(" ")
                                        for (let i = 0; i < strArr.length; i++)
                                            if (strArr[i].toLowerCase().startsWith(
                                                contactNameSearchQuery.toLowerCase()))
                                                return true
                                        return false
                                    }

                                    return filtered["_id"] !==
                                        currUser["_id"] &&
                                        checkStartsWith(filtered["username"])
                                })
                                    .map((contact) => {
                                        return (
                                            <ContactToAddToGroup
                                                contact={contact}

                                                key={contact["_id"]}
                                                handleAddContactToGroup={handleAddContactToGroup}
                                            />)
                                    })}
                            <Box pt="50px" />

                        </Box>

                    </Box>
                </DialogContent>
                <DialogActions>
                    {
                        /*
                        Button that when clicked addition of members
                        to group is confirmed
                        */
                        <Avatar
                            style={{
                                cursor: 'pointer',
                                background: "green", color: 'white'
                            }}
                            onClick={() => confirmAddNewMembersToGroup()}>
                            <CheckIcon
                            />
                        </Avatar>}
                </DialogActions>
            </Dialog>
        </Box>

    );
}
