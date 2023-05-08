import React from "react";
import "./App.css";
import MainPage from "./Components/Main_Page";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
}); 

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="App">
        <MainPage />
      </div>
    </ThemeProvider>
  );
}

export default App;