import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

/**
 * A dropdown menu of the upper app bar of the left panel of this
 * application
 * @param {*} menuItems - Array of options for the user to select in
 * from the menu when it's open 
 * @param {*} setNewGroupMode - A function that when triggered with
 * value of true the left panel of the application disapears, and a
 * panel for creating a new group displays.
 * @param {*} disconnect - Wen triggered the looged in user disconnect
 * from the application and the login page display
 */
export default function LeftPanelMenuButton({ menuItems,setNewGroupMode,
  disconnect}) {

  /*
  Varible to store the instance of event inteface when click event
  is triggered when dropdown button is clicked
  */
  const [anchorEl, setAnchorEl] = useState(null);

  //If true dropdown menu is open
  const open = Boolean(anchorEl);  

  /**
   * Triggered when current component is clicked
   * @param {*} event - Event object sent when button is clicked
   */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  //Triggered when the user closes the dropdown menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   *  A function triggered when user selects one of the options fron the
   * dropdown menu 
   * @param {*} option - Option selected by the user in the dropdown menu
   */
  const handleSelect=(option)=>
  {
    switch (option) {
      case "New Group":
        setNewGroupMode(true)
        break;
      case "Logout":
        disconnect()
        break;
      default:
        break;
    }
  }
  return (
    <Box>
      <IconButton onClick={handleClick}>
        <MoreVertIcon
          sx={{
            color: "#afbac0",
          }}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
      {
        //All the options for the user to choose from in the dropdown menu
        menuItems.map((item,index) => {
        return <MenuItem key={index} onClick={()=>handleSelect(item)}>{item}
        </MenuItem>
      })}
      </Menu>
    </Box>
  );
}
