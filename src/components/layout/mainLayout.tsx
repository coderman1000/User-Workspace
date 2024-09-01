import React, { useState, useEffect, useMemo } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { IconButton, Tooltip, Tabs, Tab, Box, Checkbox, List, ListItem, ListItemText } from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandMore, ExpandLess } from '@mui/icons-material';

const ResizablePanelsLayout = () => {
    const [leftPinned, setLeftPinned] = useState(true);
    const [rightPinned, setRightPinned] = useState(true);
    const [leftBottomPinned, setLeftBottomPinned] = useState(true);
    const [centerBottomPinned, setCenterBottomPinned] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [columns, setColumns] = useState([]);
    const [rightTab, setRightTab] = useState(0);

    useEffect(() => {
        if (!selectedTable) {
            fetch('http://localhost:5000/ABC/tables/')
                .then((response) => response.json())
                .then((data) => {
                    setSelectedTable(data); // Set the tables data
                })
                .catch((error) => console.error('Error fetching tables:', error));
        } else {
            fetch(`http://localhost:5000/ABC/tables/${selectedTable}`)
                .then((response) => response.json())
                .then((data) => {
                    setColumns(data); // Set the columns data
                })
                .catch((error) => console.error('Error fetching columns:', error));
        }
    }, [selectedTable]);

    const handleTabChange = (event, newValue) => {
        setRightTab(newValue);
    };

    const handleTableSelect = (tableName) => {
        setSelectedTable(tableName);
        setColumns([]);
    };

    const handleColumnSelect = (column) => {
        // Handle column selection logic here
        console.log('Selected column:', column);
    };

    const renderMosaicWindow = (id) => {
        switch (id) {
            case 'left':
                return (
                    <MosaicWindow
                        draggable={false}
                        title="Left Panel"
                        path={['left']}
                        additionalControls={
                            <IconButton onClick={() => setLeftPinned(false)}>
                                <ChevronLeft />
                            </IconButton>
                        }
                    >
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            <h4>Left Panel</h4>
                        </div>
                    </MosaicWindow>
                );
            case 'right':
                return (
                    <MosaicWindow
                        draggable={false}
                        title="Right Panel"
                        path={['right']}
                        additionalControls={
                            <IconButton onClick={() => setRightPinned(false)}>
                                <ChevronRight />
                            </IconButton>
                        }
                    >
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Tabs value={rightTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                                <Tab label="Tab 1" />
                                <Tab label="Tab 2" />
                            </Tabs>
                            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                {rightTab === 0 && <div style={{ padding: '10px', height: '100%' }}>Content for Tab 1</div>}
                                {rightTab === 1 && <div style={{ padding: '10px', height: '100%' }}>Content for Tab 2</div>}
                            </Box>
                        </div>
                    </MosaicWindow>
                );
            case 'leftBottom':
                return (
                    <MosaicWindow
                        draggable={false}
                        title="Left Bottom Panel"
                        path={['leftBottom']}
                        additionalControls={
                            <IconButton onClick={() => setLeftBottomPinned(false)}>
                                <ExpandMore />
                            </IconButton>
                        }
                    >
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            {!selectedTable ? (
                                <List>
                                    {selectedTable.map((table, index) => (
                                        <ListItem
                                            button
                                            key={index}
                                            onClick={() => handleTableSelect(table.name)}
                                        >
                                            <ListItemText primary={table.name} />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <List>
                                    {columns.map((column, index) => (
                                        <ListItem key={index}>
                                            <Checkbox onChange={() => handleColumnSelect(column.name)} />
                                            <ListItemText primary={column.name} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </div>
                    </MosaicWindow>
                );
            case 'centerBottom':
                return (
                    <MosaicWindow
                        draggable={false}
                        title="Center Bottom Panel"
                        path={['centerBottom']}
                        additionalControls={
                            <IconButton onClick={() => setCenterBottomPinned(false)}>
                                <ExpandMore />
                            </IconButton>
                        }
                    >
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            <h4>Center Bottom Panel</h4>
                            <p>Additional content below center...</p>
                        </div>
                    </MosaicWindow>
                );
            case 'center':
                return (
                    <MosaicWindow title="Center Panel" path={['center']} draggable={false}>
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            <h4>Center Panel</h4>
                            <p>Main content area...</p>
                        </div>
                    </MosaicWindow>
                );
            default:
                return null;
        }
    };

    const mosaicStructure = useMemo(() => {
        let layout;

        if (leftPinned && rightPinned && leftBottomPinned && centerBottomPinned) {
            layout = {
                direction: 'row',
                first: {
                    direction: 'column',
                    first: 'left',
                    second: 'leftBottom',
                    splitPercentage: 70,
                },
                second: {
                    direction: 'row',
                    first: {
                        direction: 'column',
                        first: 'center',
                        second: 'centerBottom',
                        splitPercentage: 70,
                    },
                    second: 'right',
                    splitPercentage: 80,
                },
                splitPercentage: 20,
            };
        } else if (leftPinned && !rightPinned && leftBottomPinned && centerBottomPinned) {
            layout = {
                direction: 'row',
                first: {
                    direction: 'column',
                    first: 'left',
                    second: 'leftBottom',
                    splitPercentage: 70,
                },
                second: {
                    direction: 'column',
                    first: 'center',
                    second: 'centerBottom',
                    splitPercentage: 70,
                },
                splitPercentage: 20,
            };
        } else if (!leftPinned && rightPinned && leftBottomPinned && centerBottomPinned) {
            layout = {
                direction: 'row',
                first: {
                    direction: 'column',
                    first: 'center',
                    second: 'centerBottom',
                    splitPercentage: 70,
                },
                second: 'right',
                splitPercentage: 80,
            };
        } else if (leftPinned && rightPinned && !leftBottomPinned && centerBottomPinned) {
            layout = {
                direction: 'row',
                first: 'left',
                second: {
                    direction: 'row',
                    first: {
                        direction: 'column',
                        first: 'center',
                        second: 'centerBottom',
                        splitPercentage: 70,
                    },
                    second: 'right',
                    splitPercentage: 70,
                },
                splitPercentage: 20,
            };
        } else if (leftPinned && rightPinned && leftBottomPinned && !centerBottomPinned) {
            layout = {
                direction: 'row',
                first: {
                    direction: 'column',
                    first: 'left',
                    second: 'leftBottom',
                    splitPercentage: 65,
                },
                second: {
                    direction: 'row',
                    first: 'center',
                    second: 'right',
                    splitPercentage: 80,
                },
                splitPercentage: 20,
            };
        } else {
            layout = {
                direction: 'column',
                first: 'center',
                second: 'centerBottom',
                splitPercentage: 80,
            };
        }

        return layout;
    }, [leftPinned, rightPinned, leftBottomPinned, centerBottomPinned]);

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
            <Mosaic renderTile={renderMosaicWindow} initialValue={mosaicStructure} />

            {!leftPinned && (
                <Tooltip title="Show Left Panel" placement="right">
                    <IconButton
                        onClick={() => setLeftPinned(true)}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: 10,
                            transform: 'translateY(-50%)',
                            backgroundColor: '#ffffff',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                        }}
                    >
                        <ChevronRight />
                    </IconButton>
                </Tooltip>
            )}
            {!rightPinned && (
                <Tooltip title="Show Right Panel" placement="left">
                    <IconButton
                        onClick={() => setRightPinned(true)}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            right: 10,
                            transform: 'translateY(-50%)',
                            backgroundColor: '#ffffff',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>
                </Tooltip>
            )}
            {!leftBottomPinned && (
                <Tooltip title="Show Left Bottom Panel" placement="top">
                    <IconButton
                        onClick={() => setLeftBottomPinned(true)}
                        style={{
                            position: 'fixed',
                            left: 10,
                            bottom: 10,
                            backgroundColor: '#ffffff',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                        }}
                    >
                        <ExpandLess />
                    </IconButton>
                </Tooltip>
            )}
            {!centerBottomPinned && (
                <Tooltip title="Show Center Bottom Panel" placement="top">
                    <IconButton
                        onClick={() => setCenterBottomPinned(true)}
                        style={{
                            position: 'fixed',
                            left: '50%',
                            bottom: 10,
                            transform: 'translateX(-50%)',
                            backgroundColor: '#ffffff',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                        }}
                    >
                        <ExpandLess />
                    </IconButton>
                </Tooltip>
            )}
        </div>
    );
};

export default ResizablePanelsLayout;
