import { Box, Typography } from "@mui/material"
import { useSelector } from "react-redux"

/**
 * Component used to display messages of the logged in user and his
 * partners in private and group chats
 * @param {*} channel - Channel ( group or private chat ) whose 
 * messages are displayed
 */
export default function MessagesArea({ channel }) {

    //Logged in user
    const currentUser = useSelector(state => state.authReducer).loggedInUser

    //Messages of the channel
    const messages = channel["channel_messages"]

    /*
    Whenever a channel is selected, the messages that were not
    read by the logged in user, if there was any, are read.
    this variable srores the number of unread messages just before
    they were read. 
    */
    const unread_messages_number = ("previous_unread_messages_number"
        in channel) ? channel["previous_unread_messages_number"] : 0

    /**
     * A function to display the date of a message in the format of
     * hour:minute if the message was sent less than 24 hours ago,
     * or day/month/year, hour:minute if otherwise

     * @param {*} dateString - String representation of a date
     */
    const formatDate = (dateString) => {
        let date = new Date(dateString)
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        let hour = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours()
        let minute = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()

        let now = new Date()
        if (day === now.getDate() &&
            month === now.getMonth() + 1 && year === now.getFullYear())
            return hour + ":" + minute

        return day + "/" + month + "/" + year + ", " + hour + ":" + minute

    }
    return (
        <Box>

            {messages
                //Taking the last 20 messages sent in the channel
                .slice(-20)
                .filter(message => {
                    /*
                    Filterring messages accordin to the following rules:
                    1. Messages sent in private chats are displayed 
                    without limits
                    2. messages sent in a group are displayed as long
                    as they were sent after the date time the user
                    joined the group, and after the date time he left
                    the either by himeself, or by the group admin 
                    who removed him from the group
                    */
                    let messageDate = new Date(message["sentAt"]).getTime()
                    let joinGroupDate = "join_date" in channel ?
                        (new Date(channel["join_date"])).getTime() : undefined
                    let removeFromGroupDate = "remove_date" in channel ?
                        (new Date(channel["remove_date"])).getTime() : undefined
                    let exitGroupDate = "exit_date" in channel ?
                        (new Date(channel["exit_date"])).getTime() :
                        undefined
                    return (joinGroupDate === undefined || messageDate >
                        joinGroupDate) &&
                        (removeFromGroupDate === undefined ||
                            messageDate < removeFromGroupDate) &&
                        (exitGroupDate === undefined ||
                            messageDate < exitGroupDate)
                })
                .map((channelMessage, index) => {
                    return (
                        <Box
                            sx={{
                                height: '100%',
                                width: "100%",
                                flexDirection: 'column',
                                pl: 3,
                                overflow: "hidden"
                            }}>

                            {
                                /*
                                The section in which the label that says
                                "UNREAD MESSAGES" or "UNREAD Messages" if
                                there's only 1 unread message displays
                                as long as there is at least 1 unread
                                message.
                                Under this label display all the new 
                                messages 
                                */
                                index ===
                                (messages.length - unread_messages_number) &&
                                <Box sx={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: "flex",
                                    mb: 2, mt: 2
                                }}>
                                    <Typography
                                        className="unReadMessagesBox"
                                        style={{
                                            fontSize: '14px',
                                            marginTop: '1%'
                                        }}>
                                        {unread_messages_number === 1 ?
                                            1 + " UNREAD MESSAGE" : unread_messages_number +
                                            " UNREAD MESSAGES"}
                                    </Typography>
                                </Box>
                            }
                            <Box
                                /*
                                The section for displaying current message
                                 details
                                */
                                key={index}
                                className={channelMessage["userID"] === currentUser["_id"] ?
                                    "message sent" : "message received"}>
                                {channelMessage["userID"] !== currentUser["_id"] &&
                                    <span style={{ color: "#D0E8E8" }}>
                                        {channelMessage["username"]}
                                    </span>}
                                {channelMessage["userID"] !== currentUser["_id"] &&
                                    <div>
                                        <br />
                                        <br />
                                    </div>}
                                <span>
                                    {channelMessage["text"]}
                                </span>
                                <div className="metadata">
                                    <span className="date">
                                        {formatDate(channelMessage["sentAt"] + "")}</span>
                                </div>
                            </Box>
                        </Box>
                    )
                })
            }


        </Box>
    )

}