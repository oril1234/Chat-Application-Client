import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

/**
* A dropdown menu of the upper app bar of the right panel of this
 * application
 * @param {*} menuItems - Array of options for the user to select in
 * from the menu when it's open 
 * @param {*} setShowChannelInfoSection - A function that when triggered
 * with the argument of true a side section with the full details
 * of the selected channel displays
 * @param {*} setBlockUserMode - A function that when triggered
 * with the argument of true a confirmation pop up to block the user in the
 * selected channel 
 * @param {*} setUnblockUserMode - A function that when triggered
 * with the argument of true a confirmation pop up to cancel a blocking
 * of a user by the logged in user
 * @param {*} setExitGroupMode - A function that when triggered
 * with the argument of true a confirmation pop up to exit selected group
 * displays
 * @param {*} setCloseGroupMode - A function that when triggered
 * with the argument of true a confirmation pop up to close selected group
 * by the group admin displays
 * @param {*} setDeleteChannelMode - A function that when triggered
 * with the argument of true a confirmation pop up to delete selected group
 * by the group admin displays
 */
export default function RightPanelMenuButton({ menuItems,
  setShowChannelInfoSection, setBlockUserMode, setUnblockUserMode,
  setExitGroupMode, setCloseGroupMode, setDeleteChannelMode }) {

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
  const handleSelect = (option) => {
    switch (option) {
      case "Group Info":
      case "Contact Info":
        setShowChannelInfoSection(true)
        break;
      case "Block":
        setBlockUserMode(true)
        break
      case "Unblock":
        setUnblockUserMode(true)
        break
      case "Exit Group":
        setExitGroupMode(true)
        break
      case "Close Group":
        setCloseGroupMode(true)
        break
      case "Delete Chat":
      case "Delete Group":
        setDeleteChannelMode(true)
        break

      default:
        break;
    }
    handleClose()


  }
  return (
    <Box>
      {     //Dropdown button to open dropdown menu
        <IconButton onClick={handleClick}>
          <MoreVertIcon
            sx={{
              color: "#afbac0",
            }}
          />
        </IconButton>}
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
      menuItems.map((item, index) => {
        return <MenuItem key={index} onClick={() => handleSelect(item)}>{item}</MenuItem>;
      })}
      </Menu>
    </Box>
  );
}
