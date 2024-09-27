import React, { useState, useMemo } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import TreeViewComponent from './TreeViewComponent';
import { IconButton, Tooltip, Tabs, Tab, Box, Select, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandMore, ExpandLess, Close } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MonacoEditor from '@monaco-editor/react';
import TableTreeView from './TableTreeView';

// Define multiple themes
const themes = {
    light: createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#1976d2',
            },
            background: {
                default: '#f4f5f7',
                paper: '#fff',
            },
        },
    }),
    dark: createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#bb86fc',
            },
            background: {
                default: '#121212',
                paper: '#1d1d1d',
            },
        },
    }),
    blue: createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#2196f3',
            },
            background: {
                default: '#e3f2fd',
                paper: '#bbdefb',
            },
        },
    }),
    green: createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#4caf50',
            },
            background: {
                default: '#e8f5e9',
                paper: '#c8e6c9',
            },
        },
    }),
};

const ResizablePanelsLayout = () => {
    const [leftPinned, setLeftPinned] = useState(true);
    const [rightPinned, setRightPinned] = useState(true);
    const [leftBottomPinned, setLeftBottomPinned] = useState(true);
    const [centerBottomPinned, setCenterBottomPinned] = useState(true);
    const [openFiles, setOpenFiles] = useState([]); // Track open files (tabs)
    const [activeTab, setActiveTab] = useState(null); // Track active tab (selected file)
    const [rightTab, setRightTab] = useState(0); // Manage the selected tab
    const [theme, setTheme] = useState('light'); // State to manage current theme

    // Handle double-click on a file
    const handleFileDoubleClick = async (fileId, fileName) => {
        try {
            const response = await fetch(`http://localhost:5000/api/getFileContent?file_id=${fileId}`);
            const content = await response.text();
            const contentData = JSON.parse(content);

            console.log('File content:', contentData.content);

            if (!openFiles.some(file => file.fileId === fileId)) {
                setOpenFiles(prevFiles => [
                    ...prevFiles,
                    { fileId, fileName, content: contentData.content }
                ]);
            }

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
                    <MosaicWindow theme="light"

                        draggable={false}
                        title="Left Panel"
                        path={['left']}
                        additionalControls={
                            <IconButton onClick={() => setLeftPinned(false)}>
                                <ChevronLeft />
                            </IconButton>
                        }
                    >
                        <div style={styles.panelContainer}>
                            <TreeViewComponent onFileDoubleClick={handleFileDoubleClick} />
                        </div>
                    </MosaicWindow>
                );
            case 'right':
                return (
                    <MosaicWindow theme="light"

                        draggable={false}
                        title="Right Panel"
                        path={['right']}
                        additionalControls={
                            <IconButton onClick={() => setRightPinned(false)}>
                                <ChevronRight />
                            </IconButton>
                        }
                    >
                        <div style={styles.flexColumnContainer}>
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
                        theme="light"

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
                        <div style={styles.editorContainer}>
                            <Tabs value={activeTab} onChange={handleTabChange}>
                                {openFiles.map((file) => (
                                    <Tab
                                        key={file.fileId}
                                        label={
                                            <div style={styles.tabLabel}>
                                                {file.fileName}
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTabClose(file.fileId);
                                                    }}
                                                    style={styles.tabCloseButton}
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
                                        theme="light"
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
                                    <h4>No file selected </h4>
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
        <ThemeProvider theme={themes[theme]}>
            <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
                <Select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
                >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="blue">Blue</MenuItem>
                    <MenuItem value="green">Green</MenuItem>
                </Select>

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
        </ThemeProvider>
    );
};

const styles = {
    panelContainer: {
        padding: '15px',
        background: '#f4f5f7',
        borderRadius: '8px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        height: '100%',
    },
    flexColumnContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    editorContainer: {
        padding: '10px',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    tabLabel: {
        display: 'flex',
        alignItems: 'center',
    },
    tabCloseButton: {
        marginLeft: '8px',
    },
    noFileSelected: {
        padding: '20px',
        textAlign: 'center',
    },
    fixedButton: {
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        backgroundColor: '#fff',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    },
};
export default ResizablePanelsLayout;
