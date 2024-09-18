import { TreeItem } from "@mui/x-tree-view/TreeItem";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import EditIcon from "@mui/icons-material/Edit"; // Icon for rename
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import React, { useState, useEffect, useRef } from 'react';

// Example Toaster Component (you can replace it with any toaster library like 'react-toastify')
const Toaster = ({ message, show, isError }) => (
  show ? (
    <div
      style={{
        padding: '10px',
        backgroundColor: isError ? 'red' : 'green',
        color: 'white',
        position: 'fixed',
        bottom: '20px',
        right: '20px'
      }}>
      {message}
    </div>
  ) : null
);

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
    setTimeout(() => setShowToaster(false), 3000); // Hide toaster after 3 seconds
  };

  const handleRename = async () => {
    if (newName.trim()) {
      const payload = {
        file_id: node.fileId, // Assuming `node.fileId` holds the file or folder ID
        name: newName,
      };

      // If it's a file, add content. Skip for folders.
      if (!Array.isArray(node.children)) {
        payload.content = "This is the content of this File. updated from somewhere else";
      }

      // Make the API call to update the file or folder
      try {
        const response = await fetch('http://localhost:5000/api/updateFileOrFolder', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // Check the status code for success
        if (response.ok) {
          onRenameItem(node.id, newName); // Proceed with renaming if success
          displayToaster("Renamed successfully!", false); // Show success message
        } else {
          displayToaster("Error renaming folder. Please try again.", true); // Show error if not successful
        }
      } catch (error) {
        displayToaster("Error renaming folder. Please try again.", true);
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

      // Check the status code for success
      if (response.ok) {
        onDeleteItem(node.id); // Proceed with deletion if success
        displayToaster("Deleted successfully!", false); // Show success message
      } else {
        displayToaster("Error deleting folder. Please try again.", true); // Show error if not successful
      }
    } catch (error) {
      displayToaster("Error deleting folder. Please try again.", true);
    }
  };

  const handleOpen = () => {
    // Trigger the double click action when "Open" is clicked
    onFileDoubleClick(node.fileId, node.name);
  };

  const handleKeyPress = (e) => {
    e.stopPropagation(); // Prevents keypress from affecting tree navigation
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

      <Toaster message={toasterMessage} show={showToaster} isError={isError} />
    </>
  );
};

export default CustomTreeItem;
