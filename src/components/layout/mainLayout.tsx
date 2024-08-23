import React, { useState, useMemo } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import TreeViewComponent from './TreeViewComponent';
import { IconButton, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight, ExpandMore, ExpandLess } from '@mui/icons-material';

const ResizablePanelsLayout = () => {
    const [leftPinned, setLeftPinned] = useState(true);
    const [rightPinned, setRightPinned] = useState(true);
    const [bottomPinned, setBottomPinned] = useState(true);
    const [centerBottomPinned, setCenterBottomPinned] = useState(true);

    const folderStructure = [
        {
            id: 'root',
            name: 'Root Folder',
            children: [
                { id: 'child1', name: 'Folder 1', children: [{ id: 'file1', name: 'File 1' }] },
                { id: 'child2', name: 'Folder 2', children: [{ id: 'file2', name: 'File 2' }] },
            ],
        },
    ];

    const renderMosaicWindow = (id) => {
        switch (id) {
            case 'left':
                return (
                    <MosaicWindow
                        title="Left Panel"
                        path={['left']}
                        additionalControls={
                            <IconButton onClick={() => setLeftPinned(false)}>
                                <ChevronLeft />
                            </IconButton>
                        }
                    >
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            <TreeViewComponent folderStructure={folderStructure} />
                        </div>
                    </MosaicWindow>
                );
            case 'right':
                return (
                    <MosaicWindow
                        title="Right Panel"
                        path={['right']}
                        additionalControls={
                            <IconButton onClick={() => setRightPinned(false)}>
                                <ChevronRight />
                            </IconButton>
                        }
                    >
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            <h4>Right Panel</h4>
                            <p>Content goes here...</p>
                        </div>
                    </MosaicWindow>
                );
            case 'bottom':
                return (
                    <MosaicWindow
                        title="Bottom Panel"
                        path={['bottom']}
                        additionalControls={
                            <IconButton onClick={() => setBottomPinned(false)}>
                                <ExpandMore />
                            </IconButton>
                        }
                    >
                        <div style={{ padding: '10px', background: '#e9ecef', height: '100%' }}>
                            <h4>Bottom Panel</h4>
                            <p>Additional content area...</p>
                        </div>
                    </MosaicWindow>
                );
            case 'centerBottom':
                return (
                    <MosaicWindow
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
                    <MosaicWindow title="Center Panel" path={['center']}>
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

        if (leftPinned && rightPinned && bottomPinned && centerBottomPinned) {
            layout = {
                direction: 'row',
                first: {
                    direction: 'column',
                    first: 'left',
                    second: 'bottom',
                    splitPercentage: 70,
                },
                second: {
                    direction: 'column',
                    first: {
                        direction: 'row',
                        first: 'center',
                        second: 'right',
                        splitPercentage: 80,
                    },
                    second: 'centerBottom',
                    splitPercentage: 80,
                },
                splitPercentage: 20,
            };
        } else if (leftPinned && !rightPinned && bottomPinned && centerBottomPinned) {
            layout = {
                direction: 'column',
                first: {
                    direction: 'row',
                    first: 'left',
                    second: 'center',
                    splitPercentage: 80,
                },
                second: 'centerBottom',
                splitPercentage: 80,
            };
        } else if (!leftPinned && rightPinned && bottomPinned && centerBottomPinned) {
            layout = {
                direction: 'column',
                first: {
                    direction: 'row',
                    first: 'center',
                    second: 'right',
                    splitPercentage: 80,
                },
                second: 'centerBottom',
                splitPercentage: 80,
            };
        } else if (leftPinned && rightPinned && !bottomPinned && centerBottomPinned) {
            layout = {
                direction: 'row',
                first: 'left',
                second: {
                    direction: 'row',
                    first: 'center',
                    second: 'right',
                    splitPercentage: 80,
                },
                splitPercentage: 20,
            };
        } else if (leftPinned && rightPinned && bottomPinned && !centerBottomPinned) {
            layout = {
                direction: 'row',
                first: {
                    direction: 'column',
                    first: 'left',
                    second: 'bottom',
                    splitPercentage: 70,
                },
                second: 'center',
                splitPercentage: 80,
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
    }, [leftPinned, rightPinned, bottomPinned, centerBottomPinned]);

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
            {!bottomPinned && (
                <Tooltip title="Show Bottom Panel" placement="top">
                    <IconButton
                        onClick={() => setBottomPinned(true)}
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
                        <ExpandMore />
                    </IconButton>
                </Tooltip>
            )}
        </div>
    );
};

export default ResizablePanelsLayout;
