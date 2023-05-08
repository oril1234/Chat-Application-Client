import { Box } from "@mui/material";
import React from "react";

/**
 * Custom application bar located mostly at the top of the component
 * that uses it, and contains elements such as labels and button
 * @param {*} children - The elements contained in the application bar
 */
export default function CustomAppBar({ children }) {
  return (
    <Box
      height="63px"
      sx={{
        background: "#1f2c33",
        padding: "0px 20px",
      }}
    >
      {children}
    </Box>
  );
}
