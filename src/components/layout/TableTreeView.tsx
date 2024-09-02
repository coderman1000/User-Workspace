import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FolderIcon from '@mui/icons-material/Folder';
import { MosaicWindow } from 'react-mosaic-component';

const TableTreeView = () => {
    const [tables, setTables] = useState([]);

    useEffect(() => {
        // Fetch data from the API
        fetch('http://localhost:5000/api/tables/ABC')
            .then(response => response.json())
            .then(data => setTables(data))
            .catch(error => console.error('Error fetching tables:', error));
    }, []);

    const renderTreeItems = (nodes) => (
        nodes.map((node, index) => (
            <TreeItem
                key={index}
                itemId={`table-${index}`}
                label={node.tableName}
            >
                {node.columns.map((col, colIndex) => (
                    <TreeItem
                        key={`${index}-${colIndex}`}
                        itemId={`col-${index}-${colIndex}`}
                        label={col}
                    />
                ))}
            </TreeItem>
        ))
    );

    return (

        <Box sx={{ minHeight: 352, minWidth: 250 }}>
            <SimpleTreeView
                aria-label="table tree view"
                defaultCollapseIcon={<FolderIcon />}
                defaultExpandIcon={<FolderIcon />}
            >
                {renderTreeItems(tables)}
            </SimpleTreeView>
        </Box>

    );
};

export default TableTreeView;
