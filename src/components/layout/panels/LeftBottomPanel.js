import React from "react";
import { MosaicWindow } from "react-mosaic-component";
import { IconButton } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

const LeftBottomPanel = ({ setPinned }) => (
  <MosaicWindow
    title="Left Bottom Panel"
    path={["leftBottom"]}
    additionalControls={
      <IconButton onClick={() => setPinned(false)}>
        <ExpandMore />
      </IconButton>
    }
  >
    <div style={{ padding: "10px", background: "#e9ecef", height: "100%" }}>
      <h4>Left Bottom Panel</h4>
      <p>Additional content area...</p>
    </div>
  </MosaicWindow>
);

export default LeftBottomPanel;
