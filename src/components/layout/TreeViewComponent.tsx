import React, { useState, useEffect } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import Box from '@mui/material/Box';
import CustomTreeItem from './CustomTreeItem'; // Assuming CustomTreeItem is in a separate file
import './custom-context-menu.css';

const TreeViewComponent = ({ onFileDoubleClick }) => {
    const [treeData, setTreeData] = useState([]);

    useEffect(() => {
        // Fetch folder structure data from the API
        const fetchFolderStructure = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/getFolderStructure');
                const data = await response.json();

                // Ensure the response is an object and structure it properly
                if (data && typeof data === 'object') {
                    const formattedData = formatFolderStructure([data]); // The API returns the root folder
                    setTreeData(formattedData);
                } else {
                    console.error('API response is not an object:', data);
                }
            } catch (error) {
                console.error('Error fetching folder structure:', error);
            }
        };

        fetchFolderStructure();
    }, []);

    // Recursive function to format folder and files into a proper tree structure
    const formatFolderStructure = (data, parentId = '') => {
        return data.map((item, index) => {
            const uniqueId = parentId ? `${parentId}-${index}` : `root-${index}`;

            return {
                id: uniqueId,  // Ensure unique IDs by prefixing with parent ID and index
                name: item.name,
                fileId: item.file_id, // Keep the file_id for reference
                children: [
                    ...(item.files?.map((file, fileIndex) => ({
                        id: `${uniqueId}-file-${fileIndex}`, // Ensure unique file IDs
                        name: file.name,
                        fileId: file.file_id,
                        isFile: true, // Flag to differentiate between files and folders
                    })) || []),
                    ...(item.children?.length ? formatFolderStructure(item.children, uniqueId) : []), // Recursively format subfolders
                ],
            };
        });
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
