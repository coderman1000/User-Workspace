import React from "react";
import { MosaicWindow } from "react-mosaic-component";
import { IconButton } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

const RightPanel = ({ setPinned }) => (
  <MosaicWindow
    title="Right Panel"
    path={["right"]}
    additionalControls={
      <IconButton onClick={() => setPinned(false)}>
        <ChevronRight />
      </IconButton>
    }
  >
    <div style={{ padding: "10px", background: "#e9ecef", height: "100%" }}>
      <h4>Right Panel</h4>
      <p>Content goes here...</p>
    </div>
  </MosaicWindow>
);

export default RightPanel;
