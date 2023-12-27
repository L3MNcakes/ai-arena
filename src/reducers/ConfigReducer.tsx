import { useReducer } from 'react';

export interface IConfigState {
    worldSize : {
        width : number;
        height : number;
    };

    backgroundColor : number;

    agents : {
        showNames : boolean;
        numAgents : number;
        agentSize : number;
        minSpawnEyes : number;
        maxSpawnEyes : number;
    };

    food : {
        numFood : number;
    };

    showDirection : {
        enabled : boolean;
    };

    showVision : {
        enabled : boolean;
        color : [number, number, number, number];
        detectedColor: [number, number, number, number];
    };
}

export enum ConfigActionType {
    TOGGLE_SHOW_DIRECTION,
    TOGGLE_SHOW_VISION,
    TOGGLE_SHOW_NAMES,
}

type ConfigAction =
    | { type: ConfigActionType.TOGGLE_SHOW_DIRECTION }
    | { type: ConfigActionType.TOGGLE_SHOW_VISION }
    | { type: ConfigActionType.TOGGLE_SHOW_NAMES };

const ConfigReducer = (state : IConfigState, action : ConfigAction) : IConfigState => {
    switch(action.type) {
        case ConfigActionType.TOGGLE_SHOW_DIRECTION:
            return {
                ...state,
                showDirection: {
                    ...state.showDirection,
                    enabled: !state.showDirection.enabled
                }
            };
        case ConfigActionType.TOGGLE_SHOW_VISION:
            return {
                ...state,
                showVision: {
                    ...state.showVision,
                    enabled: !state.showVision.enabled
                }
            };
        case ConfigActionType.TOGGLE_SHOW_NAMES:
            return {
                ...state,
                agents: {
                    ...state.agents,
                    showNames: !state.agents.showNames
                }
            };
        default:
            return state;
    }
}

const initialState : IConfigState = {
    worldSize: {
        width: 1200,
        height: 900
    },
    backgroundColor: 240,
    agents: {
        showNames: false,
        numAgents: 40,
        agentSize: 10,
        minSpawnEyes: 1,
        maxSpawnEyes: 2,
    },
    food: {
        numFood: 20
    },
    showDirection: {
        enabled: false
    },
    showVision: {
        enabled: true,
        color: [ 0, 40, 100, 50 ],
        detectedColor: [100, 0, 40, 50 ],
    }
};

export const useConfigReducer = () => useReducer(ConfigReducer, initialState);
