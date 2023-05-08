import React from 'react'
import { Grid, Paper, TextField, Button, Typography, Link, Avatar } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material';
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import usersSvr from '../../API services/users_service'
import { useEffect, useState } from 'react'
import ErrorDialogue from '../DialoguePopUps/ErrorPopup'
import InfoDialogue from '../DialoguePopUps/InfoPopup'

/*
Sign up component in order to create an account of a user that was
previously added to the system by the system admin
*/
export default function SignupComp({ handleChangeTabValue }) {

    //Navigation hook to navigate to login page after  successful sign up
    const navigate = useNavigate()

    /*True when sign up succeed in order to display
     successful sign up pop up
    */
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)

    /*True when sign up failed in order to display
     erro sign up pop up
    */
    const [showErrorPopup, setShowErrorPopup] = useState(false)

    /*
    The properties of the pop up that displays ( whether if it is
    successfull or failed sign up pop up)
    */
    const [popupDetails, setPopupDetails] = useState({

        //Title of pop up
        title: "",

        //Content of the message being displayed 
        content: "",

        //Function triggered in order to close the pop up
        closeFunction: null

    })

    //Style of the Material UI paper component that wrap the form
    const paperStyle = { padding: 20, height: '73vh', width: 300, margin: "0 auto" }

    //Style of the icon displayed on the top of the form
    const avatarStyle = { backgroundColor: '#1bbd7e' }

    //Style of submit button
    const btnstyle = { margin: '8px 0' }


    //Initial values of the form
    const initialValues = {
        //Email address that identifies the user when logging in to the system
        email: '',

        //The name by which the user is displayed in the application
        username: '',

        //User phone number
        phoneNumber: "",

        //User password
        password: ''
    }

    const isNumber = (num) => {
        return !isNaN(num)
    }

    //Schema of yup module in order to validate the form fields
    const validationSchema = Yup.object().shape({
        email: Yup.string().email('please enter valid email').
            required("Required"),
        username: Yup.string().required("Required")
            .min(3, "User name must be 3 characters length")
            .max(20, "User name nust be not longer than 20 characters"),
        password: Yup.string().required("Required"),
        phoneNumber: Yup.string().required("Required").test("Enter valid number",
            val => isNumber(val)).max(10,
                "Phone number must not be longer than 10 digits")
    })

    //Function triggered when submitting the sign up form
    const onSubmit = async (values,props) => {
        try {

            let new_user={...values}
            new_user["_id"]=new_user["email"]
            delete new_user["email"]
            /*
            API call in otder to send the form details (username and
            password) to the server
            */
            let resp = await usersSvr.signup(new_user)

            //Executed if login API call succeeded
            if (resp.status == 200) {

                //Updating the details of pop up when sign up succeeded
                setPopupDetails({
                    ...popupDetails,
                    title: "Successfull Signup",
                    content: "Account under the email addrress " +
                        new_user["_id"] + " has been successfully created. " +
                        "You can now login.",
                    closeFunction: closeSuccessPopup
                })

                //Displaying the successfull sign up pop up
                setShowSuccessPopup(true)
            }
        } catch (err) {

            //Updating the details of pop up when sign up failed
            setPopupDetails({
                ...popupDetails, title: "Signup Error",
                content: err.response.data.error, closeFunction: closeErrorPopup
            })

            //Displaying the failed sign up pop up
            setShowErrorPopup(true)
        }

        //Function triggered when closing successful sign up pop up
        function closeSuccessPopup(state) {
            setShowSuccessPopup(state)

            //Moving to login page by changing the value of material ui tab
            handleChangeTabValue(null, 0)
        }

        //Function triggered when closing failed sign up pop up
        function closeErrorPopup(state) {
            setShowErrorPopup(state)
        }

    }
    return (
        <Grid>
            <Paper elevation={10} style={paperStyle}>
                <Grid align='center'>
                    <Avatar style={avatarStyle}><AddCircleOutline /></Avatar>
                    <h2>Sign Up</h2>
                </Grid>
                <Formik initialValues={initialValues}
                    onSubmit={onSubmit}

                    validationSchema={validationSchema}>
                    {(props) => (
                        <Form>
                            <Field as={TextField} label='Email' name="email"
                                placeholder='Enter email' fullWidth required
                                helperText={<ErrorMessage name="email" />}
                            />

                            <Field as={TextField} label='Username' name="username"
                                placeholder='Enter username' fullWidth required
                                helperText={<ErrorMessage name="username" />}
                            />
                            <Field as={TextField} label='Password' name="password"
                                placeholder='Enter password' type='password' fullWidth required
                                helperText={<ErrorMessage name="password" />} />

                            <Field as={TextField} label='Phone Number' name="phoneNumber"
                                placeholder='Enter phone number' fullWidth required
                                helperText={<ErrorMessage name="phoneNumber" />}
                            />

                            <Button type='submit' color='primary' variant="contained" disabled={props.isSubmitting}
                                style={btnstyle} fullWidth>{props.isSubmitting ? "Loading" : "Sign Up"}</Button>

                        </Form>
                    )}
                </Formik>
                {showErrorPopup && <ErrorDialogue
                    popupDetails={popupDetails} />}

                {showSuccessPopup && <InfoDialogue
                    popUpDetails={popupDetails}

                />}

            </Paper>
        </Grid>
    )
}

