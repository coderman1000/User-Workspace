// components/TreeViewComponent.js

import React from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight, Folder, InsertDriveFile } from '@mui/icons-material';

const CustomTreeItem = ({ node, depth = 0 }) => (
    <TreeItem
        nodeId={node.id}
        label={node.name}
        icon={node.children ? <Folder /> : <InsertDriveFile />}
        sx={{
            paddingLeft: depth * 16,
            transition: 'background-color 0.3s',
            '&:hover': {
                backgroundColor: '#e8e8e8',
            },
            '& .MuiTreeItem-label': {
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#555',
                '&.Mui-expanded': {
                    backgroundColor: '#e0e0e0',
                    color: '#000',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                },
            },
        }}
    >
        {node.children && node.children.map((childNode) => (
            <CustomTreeItem key={childNode.id} node={childNode} depth={depth + 1} />
        ))}
    </TreeItem>
);

const TreeViewComponent = ({ folderStructure }) => (
    <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        sx={{
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
    >
        {folderStructure.map((tree) => (
            <CustomTreeItem key={tree.id} node={tree} />
        ))}
    </TreeView>
);

export default TreeViewComponent;
