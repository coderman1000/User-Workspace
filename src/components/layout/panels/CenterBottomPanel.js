import React from "react";
import { MosaicWindow } from "react-mosaic-component";
import { IconButton } from "@mui/material";
import { ExpandLess } from "@mui/icons-material";

const CenterBottomPanel = ({ setPinned }) => (
  <MosaicWindow
    title="Center Bottom Panel"
    path={["centerBottom"]}
    additionalControls={
      <IconButton onClick={() => setPinned(false)}>
        <ExpandLess />
      </IconButton>
    }
  >
    <div style={{ padding: "10px", background: "#e9ecef", height: "100%" }}>
      <h4>Center Bottom Panel</h4>
      <p>Additional content below center...</p>
    </div>
  </MosaicWindow>
);

export default CenterBottomPanel;
