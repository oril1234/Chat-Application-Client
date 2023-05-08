
import { useEffect, useState } from 'react';
import LoginComp from './Login';
import SignupComp from './Signup';
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import usersSvr from '../../API services/users_service'

/*
This component is a wrapper for the sign up and sign in components
in order to navigate between them using tabs
*/
const AuthWrapper = () => {

    /*Navigate hook in order to navigate to main page after login 
    to system
    */
    const navigate=useNavigate()


    useEffect(() => {
        //Executed if JWT token exists, meaning the user is logged in
        if (usersSvr.getToken()) {

            navigate("/menu")
        }


    }, [])

    /*
    Value of one of 2 tabs used to navigate between sign up and sign in
    pages
    */
    const [tabValue, setTabValue] = useState(0)

    //Triggered when one of the 2 tabs is clicked
    const handleChangeTabValue = (event, newValue) => {
        setTabValue(newValue);
    };

    
    //Css style for the material ui component of paper
    const paperStyle = { width: 340, margin: "20px auto" }


    /*
    Sub functions component which displays the cotent of the selected page
    (sign up or sign in)
    */
    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box>
                        <Typography component={'span'}>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    return (
        <div>
            <Paper elevation={20} style={paperStyle}>
                <Tabs

                    value={tabValue}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChangeTabValue}
                    aria-label="disabled tabs example"
                >
                    <Tab style={{ width: "50%" }} label="Sign In" />

                    <Tab style={{ width: "50%" }} label="Sign Up" />
                </Tabs>
                <TabPanel style={{ width: '170px' }} value={tabValue} index={0}>
                    <LoginComp handleChangeTabValue={handleChangeTabValue} />
                </TabPanel>
                <TabPanel style={{ width: '170px' }} value={tabValue} index={1}>
                    <SignupComp handleChangeTabValue={handleChangeTabValue} />
                </TabPanel>
            </Paper>
        </div>


    )
}

export default AuthWrapper;