import React, { useState, useMemo } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import TreeViewComponent from './TreeViewComponent';
import { IconButton, Tooltip, Tabs, Tab, Box } from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandMore, ExpandLess, Close } from '@mui/icons-material';
import MonacoEditor from '@monaco-editor/react';
import TableTreeView from './TableTreeView';

const ResizablePanelsLayout = () => {
    const [leftPinned, setLeftPinned] = useState(true);
    const [rightPinned, setRightPinned] = useState(true);
    const [leftBottomPinned, setLeftBottomPinned] = useState(true);
    const [centerBottomPinned, setCenterBottomPinned] = useState(true);
    const [openFiles, setOpenFiles] = useState([]);  // State to track open files (tabs)
    const [activeTab, setActiveTab] = useState(null); // Track active tab (selected file)
    const [rightTab, setRightTab] = useState(0); // State to manage the selected tab

    // Handle double-click on a file
    const handleFileDoubleClick = async (fileId, fileName) => {
        try {
            // Fetch file content
            const response = await fetch(`http://localhost:5000/api/getFileContent?file_id=${fileId}`);
            const content = await response.text(); // Assuming the content is plain text
            const contentData = JSON.parse(content);

            console.log('File content:', contentData.content);

            // Check if the file is already open
            if (!openFiles.some(file => file.fileId === fileId)) {
                // Add the new file as a new tab
                setOpenFiles(prevFiles => [
                    ...prevFiles,
                    { fileId, fileName, content: contentData.content }
                ]);
            }

            // Set the newly opened file as the active tab
            setActiveTab(fileId);

        } catch (error) {
            console.error('Error fetching file content:', error);
        }
    };

    const handleTabChange = (event, newFileId) => {
        setActiveTab(newFileId);
    };

    const handleTabClose = (fileId) => {
        setOpenFiles(prevFiles => prevFiles.filter(file => file.fileId !== fileId));

        // If the closed tab was active, switch to another tab if available
        if (activeTab === fileId && openFiles.length > 1) {
            const nextFile = openFiles.find(file => file.fileId !== fileId);
            setActiveTab(nextFile.fileId);
        } else if (openFiles.length === 1) {
            setActiveTab(null); // No tabs left
        }
    };

    const handleRightTabChange = (event, newTab) => {
        setRightTab(newTab);
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
                            <TreeViewComponent onFileDoubleClick={handleFileDoubleClick} />
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
                            <Tabs value={rightTab} onChange={handleRightTabChange} indicatorColor="primary" textColor="primary">
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
                    >
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            <TableTreeView />
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
                        <div style={{ padding: '10px', height: '100%', background: '#e9ecef' }}>
                            <Tabs value={activeTab} onChange={handleTabChange}>
                                {openFiles.map((file) => (
                                    <Tab
                                        key={file.fileId}
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {file.fileName}
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTabClose(file.fileId);
                                                    }}
                                                    style={{ marginLeft: 5 }}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </div>
                                        }
                                        value={file.fileId}
                                    />
                                ))}
                            </Tabs>

                            {openFiles.map((file) => (
                                <div key={file.fileId} style={{ display: activeTab === file.fileId ? 'block' : 'none', height: '93%' }}>
                                    <MonacoEditor
                                        height="93%"
                                        defaultLanguage="javascript"
                                        value={file.content}
                                        theme="vs-dark"
                                        options={{ readOnly: false }}
                                        onChange={(newValue) => {
                                            // Update the file content in the state
                                            setOpenFiles(prevFiles =>
                                                prevFiles.map(f => f.fileId === file.fileId ? { ...f, content: newValue } : f)
                                            );
                                        }}
                                    />
                                </div>
                            ))}

                            {openFiles.length === 0 && (
                                <div>
                                    <h4>No file selected</h4>
                                </div>
                            )}
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
