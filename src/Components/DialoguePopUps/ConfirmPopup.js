import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

/*
Component of the confirmation pop up displayed to the system admin when he
wishes to delete another user in order to give a final approval for the
deletion
*/
export default function ConfirmDialogue(props) {

    //When true pop up displays
    const [open, setOpen] = React.useState(true);

    return (
        <div>

            <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title"
                    style={{ backgroundColor: "greenBackground" 
                    in props.popupDetails?"green":"red", color: 'white', fontWeight: 'bold' }}>
                    {props.popupDetails.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {props.popupDetails.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        style={{ backgroundColor: "greenBackground" 
                        in props.popupDetails?"green":"red",
                         color: 'white', fontWeight: 'bold' }}
                        onClick={props.popupDetails.confirmFunction} autoFocus>
                        Yes
                    </Button>
                    <Button onClick={() => props.popupDetails.exitFunction(false)}>No</Button>

                </DialogActions>
            </Dialog>
        </div>
    );
}
