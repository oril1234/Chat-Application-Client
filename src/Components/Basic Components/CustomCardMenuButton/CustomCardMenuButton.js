import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from "react";

/**
 * This conponent is a dropdown menu along with a dropdown button
 * to ppen the menu. it is used in 2 types of cards
 1. A card with a channel details for the logged in user to select
 2. A card of a group member in the group details section for the
 * logged in user to select
 * @param {*} menuItems - The items of the menu for the user to select
 * @param {*} isOnHover - When true cursor is above the component
 * @param {*} setDeleteChannelMode - A function that is sent fron the
 * component chat card which displays details of a channel ( private
 * or a group chat). When triggered a confirmation pop up to delete the
 * channel displays.
 * @param {*} setExitGroupMode - A function sent from chat card component.
 * When triggered a confirmation pop up to exit current group displays
 * @param {*} setCloseGroupMode - A function sent from chat card component.
 * When triggered a confirmation pop up to close current group displays
 * @param {*} setRemoveMemberMode - A function sent from group member card
 * component.When triggered a confirmation pop up to remove current group
 * member displays
 * @param {*} setMenuOpen - A function triggered when the dropdown menu 
 * is opened to nitify the parent component
 */
export default function CustomCardMenuButton({ menuItems,isOnHover,
  setDeleteChannelMode,setExitGroupMode,setCloseGroupMode,
  setRemoveMemberMode,setMenuOpen,setOnHover}) {

  /*
  Varible to store the instance of event inteface when click event
  is triggered when dropdown button is clicked
  */
  const [anchorEl, setAnchorEl] = useState(null);

  //If true dropdown menu is open
  const open = Boolean(anchorEl);
  
  
  /**
   * Given an event instance this function is triggered when dropdown 
   * menu button is clicked
   * @param {*} event - Event object sent when button is clicked
   */
  const handleClick = (event) => {
    setMenuOpen(true)
    setAnchorEl(event.currentTarget);
  };

  //Function triggred when menu is closed
  const handleClose = () => {
    if(setOnHover!==undefined)
      setOnHover(false)
    setAnchorEl(null);
    setMenuOpen(false)
  };

  /**
   * Given an option selected by the user out of the dropdown menu items 
   * a corresponding function is triggered in order to open a confirmation
   * pop up
   * 

  * @param {*} option - The option that is being selected by the user in
  * the dropdown menue

  **/
  const handleSelect=(option)=>
  {
      switch (option) {
        case "Remove Member":
          setRemoveMemberMode(true)
          break
        case "Delete Chat":
        case "Delete Group":
          setDeleteChannelMode(true)
          break;
        case "Exit Group":
          setExitGroupMode(true)
          break

          case "Close Group":
            setCloseGroupMode(true)
            break
  
        default:
          break;
      }
      handleClose()
  }
  return (
    <Box>
      {/**Dropdown button */}
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon
          sx={{
            "color":isOnHover?"":"transparent"
          }}
        />
      </IconButton>
      {/**Menu displayed  when dropdown button is clicked */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {menuItems.map((item,index) => {
          return <MenuItem key={index} onClick={()=>handleSelect(item)}>{item}</MenuItem>;
        })}
      </Menu>
    </Box>
  );
}
