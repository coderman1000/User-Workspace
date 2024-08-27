import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Box from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import './custom-context-menu.css';

const CustomTreeItem = ({ node, onFileDoubleClick }) => {
    const renderTree = (nodes) => {
        const isFolder = Array.isArray(nodes.children);

        return (
            <ContextMenuTrigger id={nodes.id} key={nodes.id}>
                <TreeItem
                    itemId={nodes.id}
                    label={
                        <>
                            {isFolder ? <FolderIcon sx={{ marginRight: 1 }} /> : <InsertDriveFileIcon sx={{ marginRight: 1 }} />}
                            {nodes.name}
                        </>
                    }
                    onDoubleClick={() => !isFolder && onFileDoubleClick(nodes.name)}
                >
                    {isFolder && nodes.children.map((node) => renderTree(node))}
                </TreeItem>

                <ContextMenu id={nodes.id} className="custom-context-menu">
                    {isFolder ? (
                        <>
                            <MenuItem className="custom-context-menu-item" onClick={() => console.log(`Create File in ${nodes.name}`)}>Create File</MenuItem>
                            <MenuItem className="custom-context-menu-item" onClick={() => console.log(`Create Sub-Folder in ${nodes.name}`)}>Create Sub-Folder</MenuItem>
                            <MenuItem className="custom-context-menu-item" onClick={() => console.log(`Delete ${nodes.name} and Contents`)}>Delete Folder and Contents</MenuItem>
                        </>
                    ) : (
                        <>
                            <MenuItem className="custom-context-menu-item" onClick={() => console.log(`Open ${nodes.name}`)}>Open</MenuItem>
                            <MenuItem className="custom-context-menu-item" onClick={() => console.log(`Delete ${nodes.name}`)}>Delete</MenuItem>
                        </>
                    )}
                </ContextMenu>

            </ContextMenuTrigger>
        );
    };

    return renderTree(node);
};

const TreeViewComponent = ({ folderStructure, onFileDoubleClick }) => {
    return (
        <Box
            sx={{
                maxHeight: 570,
                overflowY: 'auto',
                minWidth: 250,
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <SimpleTreeView>
                {folderStructure.map((tree) => (
                    <CustomTreeItem key={tree.id} node={tree} onFileDoubleClick={onFileDoubleClick} />
                ))}
            </SimpleTreeView>
        </Box>
    );
};

export default TreeViewComponent;
