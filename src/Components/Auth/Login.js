import React from 'react'
import { Grid, Paper, TextField, Button, Typography, Link, Avatar } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import usersSvr from '../../API services/users_service'
import { useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import ErrorDialogue from '../DialoguePopUps/ErrorPopup'
import { Message } from '@mui/icons-material'

//Login component
export default function LoginComp() {

    useEffect(() => {
        //alert(window.location.host)
    }, [])
    //Navigation hook to navigate to main page
    const navigate = useNavigate()

    /*
    Redux dispatch hook in order to update redux 
    when login is successfull
    */
    const dispatch = useDispatch()

    /*
    True when login failed in order to display errop pop with 
    error message
    */
    const [showErrorPopup, setShowErrorPopup] = useState(false)

    //Properties of the error pop up - updated when displayed
    const [popupDetails, setPopupDetails] = useState({
        //Title of the pop up
        title: "Login Error",

        //The content of the message displayed in the pop up
        content: "",

        //The function trigered when closig the pop up
        closeFunction: null

    })


    //Style of material ui components that waraps the login form
    const paperStyle = { padding: 20, height: '73vh', width: 300, margin: "0 auto" }

    //Style of the icon that's on the top of the form
    const avatarStyle = { backgroundColor: '#1bbd7e' }

    //Style of submit form
    const btnstyle = { margin: '8px 0' }

    //Initial values of the form
    const initialValues = {

        //User name the identifies the user when logging in to the system
        email: '',

        //User password
        password: ''
    }

    //Schema of yup module in order to validate the form fields
    const validationSchema = Yup.object().shape({
        email: Yup.string().email('please enter valid email').required("Required"),
        password: Yup.string().required("Required")
    })

    //Function triggered when submitting the login form
    const onSubmit = async (values, props) => {
        try {
            let credentials={...values}
            credentials['_id']= credentials['email']
            delete credentials['email']
            let resp = await usersSvr.login(credentials)
            if (resp.status == 200) {

                /*
                JWT token from the server used to identify the user
                in every subsequent API call
                */
                let token = resp.data.token

                //Saving the JWT token in session storage in the client
                usersSvr.saveToken(token)

                /*
                Updating redux reducer with the user details, especially
                his permissions when he logs in to the system
                */
                dispatch({ type: "LOGIN", payload: resp.data.user })


            }
        } catch (err) {
            console.log(err)
            /*
            Updating the error pop up properties in a case the login
            failed
            */
            setPopupDetails({
                ...popupDetails, title: "Login Error",
                content: err.response.data.error, closeFunction: closeErrorPopup
            })

            //Displaying the error pop up
            setShowErrorPopup(true)
        }

        //Function triggered when pop up is closed
        function closeErrorPopup() {
            setShowErrorPopup(false)
        }

    }
    return (
        <Grid>
            <Paper elevation={10} style={paperStyle}>
                <Grid align='center'>
                    <Avatar style={avatarStyle}><LockOutlinedIcon /></Avatar>
                    <h2>Sign In</h2>
                </Grid>
                <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}

                    validationSchema={validationSchema}>
                    {(props) => (
                        <Form>
                            <Field as={TextField} label='Email' name="email"
                                placeholder='Enter email' fullWidth required
                                helperText={<ErrorMessage name="email" />}
                            />
                            <Field as={TextField} label='Password' name="password"
                                placeholder='Enter password' type='password' fullWidth required
                                helperText={<ErrorMessage name="password" />} />

                            <Button type='submit' color='primary' variant="contained" disabled={props.isSubmitting}
                                style={btnstyle} fullWidth>{props.isSubmitting ? "Loading" : "Sign in"}</Button>

                        </Form>
                    )}
                </Formik>

                {showErrorPopup && <ErrorDialogue
                    popupDetails={popupDetails} />}

            </Paper>
        </Grid>
    )
}

