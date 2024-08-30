import React, { useState, useMemo } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import TreeViewComponent from './TreeViewComponent';
import { IconButton, Tooltip, Tabs, Tab, Box } from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandMore, ExpandLess } from '@mui/icons-material';

const ResizablePanelsLayout = () => {
    const [leftPinned, setLeftPinned] = useState(true);
    const [rightPinned, setRightPinned] = useState(true);
    const [leftBottomPinned, setLeftBottomPinned] = useState(true);
    const [centerBottomPinned, setCenterBottomPinned] = useState(true);
    const [selectedFileName, setSelectedFileName] = useState(null);  // State to hold the selected file name
    const [rightTab, setRightTab] = useState(0); // State to manage the selected tab

    const folderStructure = [
        {
            id: 'root',
            name: 'Root Folder',
            children: [
                {
                    id: 'child1',
                    name: 'Folder 1',
                    children: [
                        { id: 'file1', name: 'File 1' },
                        { id: 'file2', name: 'File 2' },
                        {
                            id: 'subfolder1',
                            name: 'Subfolder 1',
                            children: [
                                { id: 'file3', name: 'File 3' },
                                {
                                    id: 'subsubfolder1',
                                    name: 'Subfolder 1.1',
                                    children: [
                                        { id: 'file4', name: 'File 4' },
                                        { id: 'file5', name: 'File 5' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'child2',
                    name: 'Folder 2',
                    children: [
                        { id: 'file6', name: 'File 6' },
                        {
                            id: 'subfolder2',
                            name: 'Subfolder 2',
                            children: [
                                { id: 'file7', name: 'File 7' },
                                { id: 'file8', name: 'File 8' },
                            ],
                        },
                        {
                            id: 'subfolder3',
                            name: 'Subfolder 3',
                            children: [
                                { id: 'file9', name: 'File 9' },
                                {
                                    id: 'subsubfolder2',
                                    name: 'Subfolder 2.1',
                                    children: [
                                        { id: 'file10', name: 'File 10' },
                                        { id: 'file11', name: 'File 11' },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'child3',
                    name: 'Folder 3',
                    children: [
                        {
                            id: 'subfolder4',
                            name: 'Subfolder 4',
                            children: [
                                { id: 'file12', name: 'File 12' },
                                { id: 'file13', name: 'File 13' },
                            ],
                        },
                        {
                            id: 'subfolder5',
                            name: 'Subfolder 5',
                            children: [
                                { id: 'file14', name: 'File 14' },
                                {
                                    id: 'subsubfolder3',
                                    name: 'Subfolder 3.1',
                                    children: [
                                        { id: 'file15', name: 'File 15' },
                                        { id: 'file16', name: 'File 16' },
                                        {
                                            id: 'subsubsubfolder1',
                                            name: 'Subfolder 3.1.1',
                                            children: [
                                                { id: 'file17', name: 'File 17' },
                                                { id: 'file18', name: 'File 18' },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];
    const handleFileDoubleClick = (fileName) => {
        setSelectedFileName(fileName);  // Set the selected file name
        console.log('Double-clicked file:', fileName);  // Optionally log the selected file name
    };

    const handleTabChange = (event, newValue) => {
        setRightTab(newValue);
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
                            <TreeViewComponent folderStructure={folderStructure} onFileDoubleClick={handleFileDoubleClick} />
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
                            <h4>Left Bottom Panel</h4>
                            <p>Additional content area...</p>
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
                                <ExpandLess />
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
                    splitPercentage: 70, // Reduced by 5%
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
                    splitPercentage: 80, // Reduced by 10%
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
                    splitPercentage: 70, // Reduced by 5%
                },
                second: {
                    direction: 'column',
                    first: 'center',
                    second: 'centerBottom',
                    splitPercentage: 70,
                },
                splitPercentage: 20, // Make the center and centerBottom occupy the evacuated space
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
                    splitPercentage: 65, // Adjusted as needed
                },
                second: {
                    direction: 'row',
                    first: 'center', // Center window takes up the space
                    second: 'right', // Right window remains in place
                    splitPercentage: 80, // Adjusted to allocate space to the center window
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
                            bottom: 10,
                            left: '50%',
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
            {!centerBottomPinned && (
                <Tooltip title="Show Center Bottom Panel" placement="top">
                    <IconButton
                        onClick={() => setCenterBottomPinned(true)}
                        style={{
                            position: 'fixed',
                            bottom: 10,
                            right: '50%',
                            transform: 'translateX(50%)',
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