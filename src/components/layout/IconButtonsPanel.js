import React from "react";
import { IconButton, Box } from "@mui/material";
import BlockIcon from "@mui/icons-material/LayersOutlined";
import LabelIcon from "@mui/icons-material/Label";
import GridOnIcon from "@mui/icons-material/GridOn";
import ImageIcon from "@mui/icons-material/Image";

const IconButtonsPanel = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap", // Wrap icons in case of small width
        gap: 2, // Gap between buttons
        padding: 2,
        width: "100%", // Adapts to parent width
        height: "100%", // Adapts to parent height
      }}
    >
      <IconButton>
        <BlockIcon fontSize="large" />
      </IconButton>
      <IconButton>
        <LabelIcon fontSize="large" />
      </IconButton>
      <IconButton>
        <GridOnIcon fontSize="large" />
      </IconButton>
      <IconButton>
        <ImageIcon fontSize="large" />
      </IconButton>
    </Box>
  );
};

export default IconButtonsPanel;
