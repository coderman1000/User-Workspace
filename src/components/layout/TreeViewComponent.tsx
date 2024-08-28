import React, { useState, useEffect, useRef } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import Box from '@mui/material/Box';
import CustomTreeItem from "./CustomTreeItem"; // Assuming CustomTreeItem is in a separate file


import './custom-context-menu.css';


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
