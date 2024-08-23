// components/TreeViewComponent.js

import React from 'react';
import { ExpandMore, ChevronRight, Folder, InsertDriveFile } from '@mui/icons-material';
import { List, ListItem, ListItemText, Collapse, IconButton, ListItemIcon } from '@mui/material';

const CustomTreeItem = ({ node, depth = 0 }) => {
    const [open, setOpen] = React.useState(false);

    const handleToggle = () => {
        setOpen(!open);
    };

    const isFolder = Array.isArray(node.children);
    const icon = isFolder ? <Folder /> : <InsertDriveFile />;

    return (
        <div style={{ paddingLeft: depth * 16, transition: 'background-color 0.3s', backgroundColor: open ? '#f0f0f0' : 'transparent' }}>
            <ListItem
                button
                onClick={handleToggle}
                style={{
                    borderRadius: '4px',
                    marginBottom: '2px',
                    padding: '8px',
                    transition: 'background-color 0.3s, color 0.3s',
                    backgroundColor: open ? '#e0e0e0' : '#fff',
                    color: open ? '#000' : '#555',
                    boxShadow: open ? '0 2px 5px rgba(0, 0, 0, 0.15)' : 'none',
                    '&:hover': {
                        backgroundColor: '#e8e8e8',
                        color: '#000',
                    },
                }}
            >
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={node.name} />
                <IconButton>
                    {open ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                {isFolder && (
                    <List component="div" disablePadding>
                        {node.children.map((childNode) => (
                            <CustomTreeItem key={childNode.id} node={childNode} depth={depth + 1} />
                        ))}
                    </List>
                )}
            </Collapse>
        </div>
    );
};

const TreeViewComponent = ({ folderStructure }) => {
    return (
        <List style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            {folderStructure.map((tree) => (
                <CustomTreeItem key={tree.id} node={tree} />
            ))}
        </List>
    );
};

export default TreeViewComponent;
