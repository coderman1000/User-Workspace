import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FolderIcon from '@mui/icons-material/Folder';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { MosaicWindow } from 'react-mosaic-component';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

const SearchContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: '2px 4px',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    marginBottom: theme.spacing(1),
}));

const ScrollableTreeView = styled(SimpleTreeView)(({ theme }) => ({
    maxHeight: '170px', // Increased height for better usability
    overflowY: 'auto',
    '& .MuiTreeItem-root': {
        '&:hover > .MuiTreeItem-content': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}));

const HighlightedLabel = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '0 1px',
    borderRadius: '4px',
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
            const hasMatchingColumns = node.columns.some(col => col.toLowerCase().includes(searchQuery));
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
                        const isMatched = col.toLowerCase().includes(searchQuery);
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

        <Box sx={{ minHeight: 150, minWidth: 300, padding: '15px' }}>
            <SearchContainer>
                <SearchIcon />
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
            <Box mt={2}>
                <Typography variant="h6">Selected Columns:</Typography>
                {selectedColumns.length > 0 ? (
                    <ul>
                        {selectedColumns.map(id => {
                            const [_, tableIdx, colIdx] = id.split('-');
                            const table = tables[tableIdx];
                            const columnName = table ? table.columns[colIdx] : 'Unknown';
                            return <li key={id}>{`${table?.tableName || 'Unknown Table'}: ${columnName}`}</li>;
                        })}
                    </ul>
                ) : (
                    <Typography variant="body2">No columns selected.</Typography>
                )}
            </Box>
        </Box>
    );
};

export default TableTreeView;
