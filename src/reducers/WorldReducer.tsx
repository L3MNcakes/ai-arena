import { useReducer } from 'react';

import { Agent } from '@classes/Agent';
import { Food } from '@classes/Food';
import { createRandomAgent } from '@factories/AgentFactory';
import { createRandomFood } from '@factories/FoodFactory';
import { IConfigState } from '@reducers/ConfigReducer';

export interface IWorldState {
    isRunning : boolean;
    agents : Agent[];
    food : Food[];
    numDied : number;
    numExtinctions : number;
}

export enum WorldActionType {
    TOGGLE_RUNNING,
    INIT_AGENTS,
    SET_AGENTS,
    SET_NUM_DIED,
    SET_NUM_EXTINCT,
    INIT_FOOD,
    SPAWN_FOOD,
}

type WorldAction =
    | { type: WorldActionType.TOGGLE_RUNNING }
    | { type: WorldActionType.INIT_AGENTS, payload: { config : IConfigState } }
    | { type: WorldActionType.SET_AGENTS, payload: Agent[] }
    | { type: WorldActionType.SET_NUM_DIED, payload: number }
    | { type: WorldActionType.INIT_FOOD, payload: { config : IConfigState } }
    | { type: WorldActionType.SPAWN_FOOD, payload: { config : IConfigState } }
    | { type: WorldActionType.SET_NUM_EXTINCT, payload: number};

const WorldReducer = (state : IWorldState, action : WorldAction) : IWorldState => {
    switch (action.type) {
        case WorldActionType.TOGGLE_RUNNING:
            return {
                ...state,
                isRunning: !state.isRunning
            };
        case WorldActionType.INIT_AGENTS:
            const agentList = [];

            for (let i = 0; i < action.payload.config.agents.numAgents; i++) {
                agentList.push( createRandomAgent(action.payload.config) );
            }

            return {
                ...state,
                agents: agentList
            };
        case WorldActionType.SET_AGENTS:
            return {
                ...state,
                agents: action.payload
            };
        case WorldActionType.SET_NUM_DIED:
            return {
                ...state,
                numDied: action.payload
            };
        case WorldActionType.SET_NUM_EXTINCT:
            return {
                ...state,
                numExtinctions: action.payload
            };
        case WorldActionType.INIT_FOOD:
            const foodList = [];

            for (let i = 0; i < action.payload.config.food.numFood; i++) {
                foodList.push( createRandomFood(action.payload.config) );
            }

            return {
                ...state,
                food: foodList
            };
        case WorldActionType.SPAWN_FOOD:
            const newFoodList = state.food.filter(x => !x.isEaten);

            while (newFoodList.length < action.payload.config.food.numFood) {
                newFoodList.push( createRandomFood(action.payload.config) );
            }

            return {
                ...state,
                food: newFoodList
            };
        default:
            return state;
    }
};

const initialState : IWorldState = {
    isRunning: false,
    agents: [],
    food: [],
    numDied: 0,
    numExtinctions: 0
};

export const useWorldReducer = () => useReducer(WorldReducer, initialState);
