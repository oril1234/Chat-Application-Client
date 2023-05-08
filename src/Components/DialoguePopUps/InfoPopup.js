import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box } from '@mui/material';

//Pop up component to display information to the user
export default function InfoDialogue(props) {

    //When true the pop up displays
    const [open] = useState(true);


    //Triggered when closing the pop up
    const handleClose = (event,reason) => {
        if(reason && reason=="backdropClick")
            return
        props.popUpDetails.closeFunction(false)
    };

    return (
        <Box>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" 
                style={{backgroundColor:'green',color:'white',fontWeight:'bold'}}>
                    {props.popUpDetails.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {props.popUpDetails.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(e)=>handleClose(e)}
                     autoFocus>
                        Continue
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
