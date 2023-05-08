import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box } from '@mui/material';

//Error pop up component in order display error messages
export default function ErrorDialogue({popupDetails}) {
    const [open] = useState(true);

    //Function triggered when closing the pop up
    const handleClose = (event,reason) => {
        if(reason && reason=="backdropClick")
            return
        popupDetails.closeFunction(false)
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
                variant='contained' color="error">
                    {popupDetails.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {popupDetails.content}
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
