import React from "react";
import { MosaicWindow } from "react-mosaic-component";
import { IconButton } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import TreeViewComponent from "./TreeViewComponent";

const LeftPanel = ({ setPinned }) => (
  <MosaicWindow
    title="Left Panel"
    path={["left"]}
    additionalControls={
      <IconButton onClick={() => setPinned(false)}>
        <ChevronLeft />
      </IconButton>
    }
  >
    <div style={{ padding: "10px", background: "#e9ecef", height: "100%" }}>
      <TreeViewComponent
        folderStructure={[
          {
            id: "root",
            name: "Root Folder",
            children: [
              {
                id: "child1",
                name: "Folder 1",
                children: [{ id: "file1", name: "File 1" }],
              },
              {
                id: "child2",
                name: "Folder 2",
                children: [{ id: "file2", name: "File 2" }],
              },
            ],
          },
        ]}
      />
    </div>
  </MosaicWindow>
);

export default LeftPanel;
