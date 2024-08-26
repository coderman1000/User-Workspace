import React from "react";
import { MosaicWindow } from "react-mosaic-component";

const CenterPanel = () => (
  <MosaicWindow title="Center Panel" path={["center"]}>
    <div style={{ padding: "10px", background: "#e9ecef", height: "100%" }}>
      <h4>Center Panel</h4>
      <p>Main content area...</p>
    </div>
  </MosaicWindow>
);

export default CenterPanel;
