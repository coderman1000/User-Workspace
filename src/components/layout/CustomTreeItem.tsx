import { TreeItem } from "@mui/x-tree-view/TreeItem";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import EditIcon from "@mui/icons-material/Edit";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import React, { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { v4 as uuidv4 } from 'uuid'; // Import UUID

const CustomTreeItem = ({
  node,
  onFileDoubleClick,
  onAddItem,
  onDeleteItem,
  onRenameItem,
}) => {
  const [isRenaming, setIsRenaming] = useState(node.isNew || false);
  const [newName, setNewName] = useState(node.name);
  const [toasterMessage, setToasterMessage] = useState("");
  const [showToaster, setShowToaster] = useState(false);
  const [isError, setIsError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  // Show the toaster for a few seconds
  const displayToaster = (message, error = false) => {
    setToasterMessage(message);
    setIsError(error);
    setShowToaster(true);
  };

  const handleRename = async () => {
    if (newName.trim()) {
      const payload = {
        file_id: node.fileId || uuidv4(), // Use existing fileId or generate new one
        name: newName,
        parent_id: node.parentId, // Send parent_id in the payload
      };

      // If it's a file, add content. Skip for folders.
      if (!Array.isArray(node.children)) {
        payload.content = "This is the content of this File. Updated from somewhere else.";
        payload.isFile = true;

      }

      const url = node.isNew
        ? 'http://localhost:5000/api/createFileOrFolder'
        : 'http://localhost:5000/api/updateFileOrFolder';

      // Make the API call to create or update the file or folder
      try {
        const response = await fetch(url, {
          method: node.isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const message = node.isNew ? "Created successfully!" : "Renamed successfully!";
          onRenameItem(node.id, newName); // Proceed with renaming or creation
          displayToaster(message, false); // Show success message
        } else {
          displayToaster("Error processing request. Please try again.", true); // Show error if not successful
        }
      } catch (error) {
        displayToaster("Error processing request. Please try again.", true);
      }
    } else {
      onDeleteItem(node.id); // Delete the node if the name is empty
    }
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/deleteFileOrFolder?file_id=${node.fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeleteItem(node.id); // Proceed with deletion if successful
        displayToaster("Deleted successfully!", false); // Show success message
      } else {
        displayToaster("Error deleting folder. Please try again.", true); // Show error if not successful
      }
    } catch (error) {
      displayToaster("Error deleting folder. Please try again.", true);
    }
  };

  const handleOpen = () => {
    onFileDoubleClick(node.fileId, node.name);
  };

  const handleKeyPress = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") handleRename();
  };

  const handleBlur = () => {
    handleRename();
  };

  const isFolder = Array.isArray(node.children);

  return (
    <>
      <ContextMenuTrigger id={node.id} key={node.id}>
        <TreeItem
          itemId={node.id}
          label={
            isRenaming ? (
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleBlur}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "4px",
                  width: "80%",
                  fontSize: "14px",
                  outline: "none",
                  boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
                }}
                autoFocus
              />
            ) : (
              <>
                {isFolder ? (
                  <FolderIcon sx={{ color: "#FFD700", marginRight: 1 }} />
                ) : (
                  <InsertDriveFileIcon sx={{ color: "#2196F3", marginRight: 1 }} />
                )}
                {node.name}
              </>
            )
          }
          onDoubleClick={() => !isFolder && onFileDoubleClick(node.fileId, node.name)}
        >
          {isFolder &&
            node.children.map((childNode) => (
              <CustomTreeItem
                key={childNode.id}
                node={childNode}
                onFileDoubleClick={onFileDoubleClick}
                onAddItem={onAddItem}
                onDeleteItem={onDeleteItem}
                onRenameItem={onRenameItem}
              />
            ))}
        </TreeItem>

        <ContextMenu id={node.id} className="custom-context-menu">
          {isFolder ? (
            <>
              <MenuItem
                className="custom-context-menu-item"
                onClick={() => onAddItem(node.id, "file")}
              >
                <NoteAddIcon sx={{ color: "#4CAF50", marginRight: 1 }} /> Create
                File
              </MenuItem>
              <MenuItem
                className="custom-context-menu-item"
                onClick={() => onAddItem(node.id, "folder")}
              >
                <CreateNewFolderIcon sx={{ color: "#FF9800", marginRight: 1 }} />{" "}
                Create Sub-Folder
              </MenuItem>
              <MenuItem
                className="custom-context-menu-item"
                onClick={handleDelete}
              >
                <DeleteIcon sx={{ color: "#F44336", marginRight: 1 }} /> Delete
                Folder and Contents
              </MenuItem>
              <MenuItem
                className="custom-context-menu-item"
                onClick={() => setIsRenaming(true)}
              >
                <EditIcon sx={{ color: "#2196F3", marginRight: 1 }} /> Rename
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem
                className="custom-context-menu-item"
                onClick={handleOpen}
              >
                <OpenInBrowserIcon sx={{ color: "#3F51B5", marginRight: 1 }} />{" "}
                Open
              </MenuItem>
              <MenuItem
                className="custom-context-menu-item"
                onClick={handleDelete}
              >
                <DeleteIcon sx={{ color: "#F44336", marginRight: 1 }} /> Delete
              </MenuItem>
              <MenuItem
                className="custom-context-menu-item"
                onClick={() => setIsRenaming(true)}
              >
                <EditIcon sx={{ color: "#2196F3", marginRight: 1 }} /> Rename
              </MenuItem>
            </>
          )}
        </ContextMenu>
      </ContextMenuTrigger>

      <Snackbar
        open={showToaster}
        autoHideDuration={3000}
        onClose={() => setShowToaster(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        style={{ zIndex: 9999 }} // Ensure it's in the foreground
      >
        <Alert
          onClose={() => setShowToaster(false)}
          severity={isError ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {toasterMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CustomTreeItem;
