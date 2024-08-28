import React, { useState, useEffect, useRef } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Box from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import './custom-context-menu.css';
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
            onRenameItem(node.id, newName);
        } else {
            onDeleteItem(node.id); // Delete the node if the name is empty
        }
        setIsRenaming(false);
    };

    const handleKeyPress = (e) => {
        e.stopPropagation(); // Prevents keypress from affecting tree navigation
        if (e.key === 'Enter') handleRename();
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
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '4px',
                                width: '80%',
                                fontSize: '14px',
                                outline: 'none',
                                boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)',
                            }}
                            autoFocus
                        />
                    ) : (
                        <>
                            {isFolder ? (
                                <FolderIcon
                                    sx={{ color: '#FFD700', marginRight: 1 }}
                                />
                            ) : (
                                <InsertDriveFileIcon
                                    sx={{ color: '#2196F3', marginRight: 1 }}
                                />
                            )}
                            {node.name}
                        </>
                    )
                }
                onDoubleClick={() => !isFolder && onFileDoubleClick(node.name)}
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
                            onClick={() => onAddItem(node.id, 'file')}
                        >
                            <NoteAddIcon
                                sx={{ color: '#4CAF50', marginRight: 1 }}
                            />{' '}
                            Create File
                        </MenuItem>
                        <MenuItem
                            className="custom-context-menu-item"
                            onClick={() => onAddItem(node.id, 'folder')}
                        >
                            <CreateNewFolderIcon
                                sx={{ color: '#FF9800', marginRight: 1 }}
                            />{' '}
                            Create Sub-Folder
                        </MenuItem>
                        <MenuItem
                            className="custom-context-menu-item"
                            onClick={() => onDeleteItem(node.id)}
                        >
                            <DeleteIcon
                                sx={{ color: '#F44336', marginRight: 1 }}
                            />{' '}
                            Delete Folder and Contents
                        </MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem
                            className="custom-context-menu-item"
                            onClick={() => console.log(`Open ${node.name}`)}
                        >
                            <OpenInBrowserIcon
                                sx={{ color: '#3F51B5', marginRight: 1 }}
                            />{' '}
                            Open
                        </MenuItem>
                        <MenuItem
                            className="custom-context-menu-item"
                            onClick={() => onDeleteItem(node.id)}
                        >
                            <DeleteIcon
                                sx={{ color: '#F44336', marginRight: 1 }}
                            />{' '}
                            Delete
                        </MenuItem>
                    </>
                )}
            </ContextMenu>
        </ContextMenuTrigger>
    );
};


const TreeViewComponent = ({ folderStructure, onFileDoubleClick }) => {
    const [treeData, setTreeData] = useState(folderStructure);

    const findNodeById = (nodes, id) => {
        for (let node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const foundNode = findNodeById(node.children, id);
                if (foundNode) return foundNode;
            }
        }
        return null;
    };

    const handleAddItem = (parentId, type) => {
        const newTreeData = [...treeData];
        const parentNode = findNodeById(newTreeData, parentId);

        if (parentNode) {
            const newNode = {
                id: `${parentId}-${parentNode.children.length + 1}`,
                name: '',
                isNew: true,
                children: type === 'folder' ? [] : null,
            };

            if (Array.isArray(parentNode.children)) {
                parentNode.children.push(newNode);
            } else {
                parentNode.children = [newNode];
            }

            setTreeData(newTreeData);
        }
    };

    const handleDeleteItem = (id) => {
        const deleteNodeById = (nodes, nodeId) => {
            return nodes.filter((node) => {
                if (node.id === nodeId) return false;
                if (node.children) {
                    node.children = deleteNodeById(node.children, nodeId);
                }
                return true;
            });
        };

        const newTreeData = deleteNodeById([...treeData], id);
        setTreeData(newTreeData);
    };

    const handleRenameItem = (id, newName) => {
        const renameNodeById = (nodes, nodeId) => {
            for (let node of nodes) {
                if (node.id === nodeId) {
                    node.name = newName;
                    node.isNew = false;
                } else if (node.children) {
                    renameNodeById(node.children, nodeId);
                }
            }
        };

        const newTreeData = [...treeData];
        renameNodeById(newTreeData, id);
        setTreeData(newTreeData);
    };

    return (
        <Box
            sx={{
                height: 570,
                overflowY: 'auto',
                minWidth: 250,
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <SimpleTreeView>
                {treeData.map((tree) => (
                    <CustomTreeItem
                        key={tree.id}
                        node={tree}
                        onFileDoubleClick={onFileDoubleClick}
                        onAddItem={handleAddItem}
                        onDeleteItem={handleDeleteItem}
                        onRenameItem={handleRenameItem}
                    />
                ))}
            </SimpleTreeView>
        </Box>
    );
};

export default TreeViewComponent;
