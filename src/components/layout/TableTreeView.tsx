import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FolderIcon from '@mui/icons-material/Folder';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';

const SearchContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: '6px 12px',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
}));

const ScrollableTreeView = styled(SimpleTreeView)(({ theme }) => ({
    maxHeight: '200px',
    overflowY: 'auto',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.background.default,
    '& .MuiTreeItem-root': {
        '&:hover > .MuiTreeItem-content': {
            backgroundColor: theme.palette.action.hover,
        },
        '& .MuiTreeItem-label': {
            paddingLeft: theme.spacing(1),
        },
    },
}));

const LabelContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
}));


const TableTreeView = () => {
    const [tables, setTables] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expanded, setExpanded] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);

    useEffect(() => {
        // Fetch data from the API
        fetch('http://localhost:5000/api/tables/ABC')
            .then(response => response.json())
            .then(data => setTables(data))
            .catch(error => console.error('Error fetching tables:', error));
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const newExpanded = tables
                .filter(table =>
                    table.tableName.toLowerCase().includes(searchQuery) ||
                    table.columns.some(col => col.toLowerCase().includes(searchQuery))
                )
                .map((_, index) => `table-${index}`);
            setExpanded(newExpanded);
        } else {
            setExpanded([]); // Collapse all when search is cleared
        }
    }, [searchQuery, tables]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const handleCheckboxChange = (columnId) => (event) => {
        if (event.target.checked) {
            setSelectedColumns(prev => [...prev, columnId]);
        } else {
            setSelectedColumns(prev => prev.filter(id => id !== columnId));
        }
    };

    const highlightMatch = (label) => {
        if (!searchQuery) return label;
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        const parts = label.split(regex);
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === searchQuery ? (
                        <HighlightedLabel key={index}>{part}</HighlightedLabel>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </>
        );
    };

    const filterTables = (tables) => {
        if (!searchQuery) return tables;
        return tables.filter(table =>
            table.tableName.toLowerCase().includes(searchQuery) ||
            table.columns.some(col => col.toLowerCase().includes(searchQuery))
        );
    };

    const renderTreeItems = (nodes) => (
        nodes.map((node, index) => {
            const tableId = `table-${index}`;
            return (
                <TreeItem
                    key={tableId}
                    itemId={tableId}
                    label={
                        <Typography variant="body1" fontWeight="bold">
                            {highlightMatch(node.tableName)}
                        </Typography>
                    }
                >
                    {node.columns.map((col, colIndex) => {
                        const columnId = `col-${index}-${colIndex}`;
                        return (
                            <TreeItem
                                key={columnId}
                                itemId={columnId}
                                label={
                                    <LabelContainer>
                                        <Checkbox
                                            checked={selectedColumns.includes(columnId)}
                                            onChange={handleCheckboxChange(columnId)}
                                            size="small"
                                        />
                                        <Typography variant="body2">
                                            {highlightMatch(col)}
                                        </Typography>
                                    </LabelContainer>
                                }
                            />
                        );
                    })}
                </TreeItem>
            );
        })
    );

    return (
        <Box sx={{ minHeight: 200, minWidth: 350, padding: '20px' }}>
            <SearchContainer>
                <SearchIcon sx={{ marginRight: 1 }} />
                <InputBase
                    placeholder="Search tables or columns..."
                    inputProps={{ 'aria-label': 'search' }}
                    onChange={handleSearchChange}
                    fullWidth
                />
            </SearchContainer>
            <ScrollableTreeView
                aria-label="table tree view"
                defaultCollapseIcon={<FolderIcon />}
                defaultExpandIcon={<FolderIcon />}
                expanded={expanded}
                onNodeToggle={(event, nodeIds) => setExpanded(nodeIds)}
            >
                {renderTreeItems(filterTables(tables))}
            </ScrollableTreeView>


        </Box>
    );
};

export default TableTreeView;
