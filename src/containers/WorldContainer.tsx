import React, { useEffect, useState } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { Random, browserCrypto } from 'random-js';

import { Agent, AgentEye } from '@classes/Agent';
import { Food } from '@classes/Food';
import { useAppContext } from '@context/AppContext';
import { breedAgents, createRandomAgent } from '@factories/AgentFactory';
import { WorldActionType } from '@reducers/WorldReducer';

const rng = new Random(browserCrypto);

export const WorldContainer = () => {
    const ctx = useAppContext();

    const [ config, ] = ctx.configReducer;
    const [ world, dispatchWorld ] = ctx.worldReducer;
    const [ p5Instance, setP5Instance ] = ctx.p5Instance;
    const [ generation, setGeneration ] = useState(0);
    const [ numMutants, setNumMutants ] = useState(0);
    const [ totalMutants, setTotalMutants ] = useState(0);
    const [ foodEaten, setFoodEaten ] = useState(0);
    const [ foodEatenLast, setFoodEatenLast] = useState(0);
    const [ foodEatenMax, setFoodEatenMax ] = useState(0);

    useEffect(() => {
        if (!p5Instance) return;

        if (world.isRunning && !p5Instance.isLooping()) {
            p5Instance.loop();
        } else if (!world.isRunning && p5Instance.isLooping()) {
            p5Instance.noLoop();
        }
    }, [ p5Instance, world.isRunning ]);

    const styles = {
        marginTop: '25px'
    };

    const setup = (p5 : p5Types, canvasParentRef : Element) => {
        setP5Instance(p5);

        dispatchWorld({
            type: WorldActionType.INIT_AGENTS,
            payload: { config }
        });

        dispatchWorld({
            type: WorldActionType.INIT_FOOD,
            payload: { config }
        });

        p5.createCanvas(
            config.worldSize.width,
            config.worldSize.height
        ).parent(canvasParentRef);

        p5.frameRate(60);
        p5.noLoop();
    };

    const _clearFrame = (p5 : p5Types) => {
        p5.clear();
        p5.background(config.backgroundColor);
    };

    const draw = (p5 : p5Types) => {
        _clearFrame(p5);

        p5.push();
        p5.textAlign(p5.LEFT);
        p5.textSize(12);
        p5.text(`Active Mutant Genes: ${numMutants}`, 5, config.worldSize.height - 5);
        p5.text(`Total Mutations: ${totalMutants}`, 5, config.worldSize.height - 17);
        p5.text(`Generation: ${generation}`, 5, config.worldSize.height - 30);
        p5.pop();

        p5.push();
        p5.textAlign(p5.LEFT);
        p5.textSize(12);
        p5.text(`Max Food Eaten: ${foodEatenMax}`, config.worldSize.width / 2, config.worldSize.height - 5);
        p5.text(`Food Eaten Last Gen: ${foodEatenLast}`, config.worldSize.width / 2, config.worldSize.height - 17);
        p5.text(`Food Eaten This Gen: ${foodEaten}`, config.worldSize.width / 2, config.worldSize.height - 30);
        p5.pop();

        p5.push();
        p5.textAlign(p5.RIGHT);
        p5.textSize(12);
        p5.text(`Running Frame: ${p5.frameCount}`, config.worldSize.width - 5, config.worldSize.height - 5);
        p5.pop();

        if (p5.frameCount % 250 === 0) {
            const detectedAgentIds : string[] = [];

            world.agents.forEach( (agent : Agent) => {
                agent.eyes.forEach( (eye : AgentEye) => {
                    if (eye.detectedAgent) {
                        detectedAgentIds.push(eye.detectedAgent.uuid);
                    }
                });
            });

            const survivingAgents = world.agents.sort( (a : Agent, b : Agent) => {
                return b.numEaten - a.numEaten;
            }).slice(0, config.agents.numAgents / 2);

            dispatchWorld({
                type: WorldActionType.SET_NUM_DIED,
                payload: (config.agents.numAgents - survivingAgents.length)
            });

            handleSurvivors(survivingAgents);
        } else {
            let foodEaten = 0;

            world.agents.forEach( (agent : Agent) => {
                agent.detect2(world.agents, world.food);
                agent.foodCheck(world.food);
                foodEaten += agent.numEaten;
                agent.draw(p5, config);
            });

            world.food.forEach( (food : Food) => {
                food.draw(p5);
            });

            setFoodEaten(foodEaten);

            dispatchWorld({
                type: WorldActionType.SPAWN_FOOD,
                payload: { config }
            });
        }
    };

    const handleSurvivors = (agents : Agent[]) : void => {
        let newAgents : Agent[] = [];

        while (newAgents.length < config.agents.numAgents) {
            let doneAgents : string[] = [];

            agents.forEach( (parent1 : Agent) => {
                if (newAgents.length === config.agents.numAgents) return;

                agents.forEach( (parent2 : Agent) => {
                    if (newAgents.length === config.agents.numAgents) return;

                    if (parent1.uuid !== parent2.uuid && !doneAgents.includes(parent2.uuid)) {
                        newAgents.push(
                            breedAgents(parent1, parent2, config)
                        );
                    }
                });

                doneAgents.push(parent1.uuid);
            });
        }

        const numMutants = newAgents.reduce( (acc : number, agent : Agent) => {
            const mutatantGenes = agent.genome.getAllMutants();

            return acc + mutatantGenes.length;
        }, 0);

        setNumMutants(numMutants);
        setTotalMutants(totalMutants + numMutants);
        setGeneration(generation + 1);
        setFoodEatenLast(foodEaten);
        setFoodEatenMax(foodEaten > foodEatenMax ? foodEaten : foodEatenMax);

        dispatchWorld({ type: WorldActionType.SET_AGENTS, payload: newAgents });
    }

    return (
        <Sketch setup={setup} draw={draw} style={styles}></Sketch>
    );
};
