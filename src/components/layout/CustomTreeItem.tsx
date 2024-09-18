import { TreeItem } from "@mui/x-tree-view/TreeItem";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import React, { useState, useEffect, useRef } from 'react';

const CustomTreeItem = ({
  node,
  onFileDoubleClick,
  onAddItem,
  onDeleteItem,
  onRenameItem,
}) => {
  const [isRenaming, setIsRenaming] = useState(node.isNew || false);
  const [newName, setNewName] = useState(node.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (newName.trim()) {
      // Make the API call to update the file or folder
      fetch('http://localhost:5000/api/updateFileOrFolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: node.fileId, // Assuming `node.fileId` holds the file or folder ID
          name: newName,
          content: "This is the content of this File. updated from somewhere else"
        })
      });
      onRenameItem(node.id, newName);
    } else {
      onDeleteItem(node.id); // Delete the node if the name is empty
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    fetch(`http://localhost:5000/api/deleteFileOrFolder?file_id=${node.fileId}`, {
      method: 'DELETE'
    });
    onDeleteItem(node.id);
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
              Rename
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
              Rename
            </MenuItem>
          </>
        )}
      </ContextMenu>
    </ContextMenuTrigger>
  );
};
export default CustomTreeItem;
