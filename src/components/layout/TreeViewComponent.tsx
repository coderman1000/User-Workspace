import React, { useState, useEffect } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import Box from '@mui/material/Box';
import CustomTreeItem from "./CustomTreeItem"; // Assuming CustomTreeItem is in a separate file
import './custom-context-menu.css';

const TreeViewComponent = ({ onFileDoubleClick }) => {
    const [treeData, setTreeData] = useState([]);

    useEffect(() => {
        // Fetch folder structure data from the API
        const fetchFolderStructure = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/getFolderStructure');
                const data = await response.json();
                const formattedData = formatFolderStructure(data);
                setTreeData(formattedData);
            } catch (error) {
                console.error('Error fetching folder structure:', error);
            }
        };

        fetchFolderStructure();
    }, []);

    // Function to format the API response into the structure expected by the component
    const formatFolderStructure = (data) => {
        return data.map(item => ({
            id: item.file_id,
            name: item.name,
            children: [
                ...item.files.map(file => ({
                    id: file.file_id,
                    name: file.name,
                })),
                ...formatFolderStructure(item.children)
            ]
        }));
    };

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
