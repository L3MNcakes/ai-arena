import Victor from 'victor';
import { Random, browserCrypto } from 'random-js';

import { Agent, AgentEye } from '@classes/Agent';
import {
    AgentGenome,
    ColorGene,
    ColorGeneData,
    EyeGene,
    NeuronWeightsData,
    NeuronWeightsGene
} from '@classes/AgentGenome';
import { IConfigState } from '@reducers/ConfigReducer';

const rng = new Random(browserCrypto);

export const createRandomAgent = (
    config : IConfigState
) : Agent => {
    const uuid = rng.uuid4();
    const position = new Victor(
        rng.integer(config.agents.agentSize + 100, config.worldSize.width - config.agents.agentSize - 100),
        rng.integer(config.agents.agentSize + 100, config.worldSize.height - config.agents.agentSize - 100)
    );
    //const position = new Victor(
        //rng.integer(300, 400),
        //rng.integer(300, 400)
    //);
    const size = config.agents.agentSize;
    const rotation = rng.real(0, (Math.PI * 2));
    const numEyes = rng.integer(config.agents.minSpawnEyes, config.agents.maxSpawnEyes);

    return new Agent({
        uuid,
        position,
        size,
        rotation,
        genome: createRandomGenome(numEyes),
    });
};

export const breedAgents = (
    parent1 : Agent,
    parent2 : Agent,
    config : IConfigState
) : Agent => {
    const child1_uuid = rng.uuid4();

    const child1_position = new Victor(
        rng.integer(config.agents.agentSize + 100, config.worldSize.width - config.agents.agentSize - 100),
        rng.integer(config.agents.agentSize + 100, config.worldSize.height - config.agents.agentSize - 100)
    );

    const child1_genome = parent1.genome.breedWith(parent2.genome, 0.05);

    const child1_rotation = rng.real(0, (Math.PI * 2));

    const size = config.agents.agentSize;

    const child1 = new Agent({
        uuid: child1_uuid,
        position: child1_position,
        genome: child1_genome,
        rotation: child1_rotation,
        size
    });

    return child1;
    //return [ child1, child2 ];
};

export const createRandomEye = () : AgentEye => {
    const randomEye = {
        //fieldOfVision: Math.PI * 2,
        fieldOfVision: rng.real(Math.PI / 6, (5 * Math.PI) / 6),
        //rangeOfVision: 100,
        rangeOfVision: rng.integer(50, 150),
        //eyeLocation: 0,
        eyeLocation: rng.real(0, (Math.PI * 2)),
        canDetect: false
    };

    return randomEye;
};

export const createRandomGenome = (numEyes : number) : AgentGenome => {
    const numHiddenLayers = 5;

    const genome = new AgentGenome();
    const colorGene = createRandomColorGene();

    genome.addGene(colorGene);

    for (let i = 0; i < numEyes; i++) {
        const eyeData = createRandomEye();
        const eyeGene = new EyeGene({ data: eyeData });
        genome.addGene(eyeGene);
    }

    const neuronWeightsGene = createRandomNeuronWeightsGene(numEyes);
    genome.addGene(neuronWeightsGene);

    const ihGene = createRandomIHWeightsGene(numEyes, numHiddenLayers);
    genome.addGene(ihGene);

    const hoGene = createRandomHOWeighsGene(numHiddenLayers);
    genome.addGene(hoGene);

    return genome;
};

export const createRandomColorGene = () : ColorGene => {
    const colorData : ColorGeneData = [ rng.integer(0, 255), rng.integer(0, 255), rng.integer(0, 255) ];

    return new ColorGene({ data: colorData });
};

export const createRandomNeuronWeightsGene = (numEyes : number) : NeuronWeightsGene => {
    const weights = [];

    const numInputs = (numEyes * 9) + 5;
    for (let i = 0; i < numInputs; i++) {
        weights.push([
            rng.bool() ? rng.real(-4, 4) : 0,
            rng.bool() ? rng.real(-4, 4) : 0
        ]);
    }

    const data : NeuronWeightsData = {
        inputType: 'input',
        outputType: 'output',
        weightMatrix: weights
    };

    return new NeuronWeightsGene({ data });
};

export const createRandomIHWeightsGene = (numEyes : number, numHidden : number) : NeuronWeightsGene => {
    const weights = [];

    const numInputs = (numEyes * 9) + 5;
    for (let i = 0; i < numInputs; i++) {
        let outWeights = [];

        for (let j = 0; j < numHidden; j++) {
            //outWeights.push(rng.bool() ? rng.real(-4, 4) : 0);
            outWeights.push(0);
        }

        weights.push(outWeights);
    }

    const data : NeuronWeightsData = {
        inputType: 'input',
        outputType: 'hidden',
        weightMatrix: weights
    };

    return new NeuronWeightsGene({ data });
};

export const createRandomHOWeighsGene = (numHidden : number) : NeuronWeightsGene => {
    const weights = [];

    for (let i = 0; i < numHidden; i++) {
        weights.push([0, 0]);
        //weights.push([
            //rng.bool() ? rng.real(-10, 10) : 0,
            //rng.bool() ? rng.real(-10, 10) : 0
        //]);
    }

    const data : NeuronWeightsData = {
        inputType: 'hidden',
        outputType: 'output',
        weightMatrix: weights
    };

    return new NeuronWeightsGene({ data });
};
