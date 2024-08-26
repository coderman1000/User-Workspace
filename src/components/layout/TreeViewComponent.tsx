import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Box from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const CustomTreeItem = ({ node, onFileDoubleClick }) => {
    const renderTree = (nodes) => {
        const isFolder = Array.isArray(nodes.children);

        return (
            <TreeItem
                key={nodes.id}
                itemId={nodes.id}
                label={
                    <>
                        {isFolder ? <FolderIcon sx={{ marginRight: 1 }} /> : <InsertDriveFileIcon sx={{ marginRight: 1 }} />}
                        {nodes.name}
                    </>
                }
                onDoubleClick={() => !isFolder && onFileDoubleClick(nodes.name)}  // Trigger callback on double click
            >
                {isFolder && nodes.children.map((node) => renderTree(node))}
            </TreeItem>
        );
    };

    return renderTree(node);
};

const TreeViewComponent = ({ folderStructure, onFileDoubleClick }) => {
    return (
        <Box
            sx={{
                maxHeight: 400,
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
