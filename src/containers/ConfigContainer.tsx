import React from 'react';

import { useAppContext } from '@context/AppContext';
import { ConfigActionType } from '@reducers/ConfigReducer';
import { WorldActionType } from '@reducers/WorldReducer';

export const ConfigContainer = () => {
    const ctx = useAppContext();

    const [ config, dispatchConfig ] = ctx.configReducer;
    const [ world, dispatchWorld ] = ctx.worldReducer;

    const wrapperStyles = {
        backgroundColor: '#DDD',
        padding: '10px',
        marginTop: '20px',
    };

    const rowStyles = {
        width: '900px',
        display: 'inline-flex'
    };

    const itemStyles = {
        margin: '10px 0px',
        marginRight: '20px',
        width: '33%'
    };

    const headerItemStyles = {
        margin: '5px 0px',
        fontWeight: 'bold',
        fontSize: '20px',
        borderBottom: '1px solid #000',
        width: '100%',
        padding: '5px',
    };

    const inputStyles = {
        margin: '0px 0px',
        padding: '5px',
        width: '100%',
    };

    const inputLabelStyles = {};

    const buttonStyles = {
        width: '100%',
    };

    const onPlayPauseClick = () => {
        dispatchWorld({ type: WorldActionType.TOGGLE_RUNNING });
    };

    const onShowDirectionChange = () => {
        dispatchConfig({ type: ConfigActionType.TOGGLE_SHOW_DIRECTION });
    };

    const onShowVisionChange = () => {
        dispatchConfig({ type: ConfigActionType.TOGGLE_SHOW_VISION });
    };

    const onShowNamesChange = () => {
        dispatchConfig({ type: ConfigActionType.TOGGLE_SHOW_NAMES });
    };

    const onDumpAgentsClick = () => {
        console.log(world.agents);
    };

    return (
        <div className='flex-container-column' style={wrapperStyles}>
            {/**
              *  SIMULATION CONTROLS
              */}
            <div className='flex-container-row' style={rowStyles}>
                <span className='flex-item' style={headerItemStyles}>Simulation Controls</span>
            </div>
            <div className='flex-container-row' style={rowStyles}>
                <div className='flex-item' style={itemStyles}>
                    <button onClick={onPlayPauseClick} style={buttonStyles}>{ world.isRunning ? 'Pause' : 'Play' }</button>
                </div>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Show Direction:</span>
                    <input type="checkbox" defaultChecked={config.showDirection.enabled} onChange={onShowDirectionChange} />
                </div>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Show Vision:</span>
                    <input type="checkbox" defaultChecked={config.showVision.enabled} onChange={onShowVisionChange} />
                </div>
            </div>
            <div className='flex-container-row' style={rowStyles}>
                <div className='flex-item' style={itemStyles}>
                    <button onClick={onDumpAgentsClick} style={buttonStyles}>Dump Agents to Console</button>
                </div>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Show Agent Names:</span>
                    <input type="checkbox" defaultChecked={config.agents.showNames} onChange={onShowNamesChange} />
                </div>
                <div className='flex-item' style={itemStyles}></div>
            </div>

            {/**
              *  WORLD SETTINGS
              */}
            <div className='flex-container-row' style={rowStyles}>
                <span className='flex-item' style={headerItemStyles}>World Settings</span>
            </div>
            <div className='flex-container-row' style={rowStyles}>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Width:</span>
                    <input type='number' style={inputStyles} value={config.worldSize.width} disabled />
                </div>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Height:</span>
                    <input type='number' style={inputStyles} value={config.worldSize.height} disabled />
                </div>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Background:</span>
                    <input type='number' style={inputStyles} value={config.backgroundColor} disabled />
                </div>
            </div>

            {/**
              *  AGENT SETTINGS
              */}
            <div className='flex-container-row' style={rowStyles}>
                <span className='flex-item' style={headerItemStyles}>Agent Settings</span>
            </div>
            <div className='flex-container-row' style={rowStyles}>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Num Agents:</span>
                    <input type='number' style={inputStyles} value={config.agents.numAgents} disabled />
                </div>
                <div className='flex-item' style={itemStyles}>
                    <span style={inputLabelStyles}>Agent Size:</span>
                    <input type='number' style={inputStyles} value={config.agents.agentSize} disabled />
                </div>
                <div className='flex-item' style={itemStyles}></div>
            </div>
        </div>
    );
};
