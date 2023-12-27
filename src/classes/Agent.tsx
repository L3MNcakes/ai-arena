import p5Types from 'p5';
import Victor from 'victor';
import { Random, browserCrypto } from 'random-js';

import { IConfigState } from '@reducers/ConfigReducer';
import { AgentGenome, NeuronWeightsGene } from '@classes/AgentGenome';
import { AgentBrain } from '@classes/AgentBrain';
import { Food } from '@classes/Food';

const rng = new Random(browserCrypto);

interface AgentProps {
    uuid : string;
    position : Victor;
    size : number;
    rotation : number;

    genome : AgentGenome;
}

export interface AgentEye {
    fieldOfVision : number;
    rangeOfVision : number;
    eyeLocation : number;
    canDetect : boolean;
    detectedAgent ?: Agent | null;
    lastAgentPos ?: Victor;
    detectedFood ?: Food | null;
    lastFoodPos ?: Victor;
}

export class Agent {
    public uuid : string;
    public position : Victor;
    public size : number;
    public rotation : number;
    public genome : AgentGenome;

    private _eyes : AgentEye[];
    get eyes() : AgentEye[] {
        return this._eyes;
    }

    private detectionLog : string[] = [];
    private color : [ number, number, number ];
    private brain : AgentBrain;

    private _numEaten : number = 0;
    get numEaten() : number {
        return this._numEaten;
    }

    private _isMutant : boolean = false;


    constructor(props : AgentProps) {
        this.uuid = props.uuid;
        this.position = props.position;
        this.size = props.size;
        this.rotation = props.rotation;
        this.genome = props.genome;

        this.color = this.genome.getAllGenesOfName('ColorGene')[0].data as [number, number, number];
        this._eyes = this.genome.getAllGenesOfName('EyeGene').map(g => g.data as AgentEye);
        this._isMutant = this.genome.getAllMutants().length > 0;

        const neuronWeights = this.genome.getAllGenesOfName('NeuronWeightsGene') as NeuronWeightsGene[];

        const ioWeights = neuronWeights.find( (x : NeuronWeightsGene) => {
            return x.data.inputType === 'input' && x.data.outputType === 'output';
        }) as NeuronWeightsGene;

        const ihWeights = neuronWeights.find( (x : NeuronWeightsGene) => {
            return x.data.inputType === 'input' && x.data.outputType === 'hidden';
        }) as NeuronWeightsGene;

        const hoWeights = neuronWeights.find( (x : NeuronWeightsGene)  => {
            return x.data.inputType === 'hidden' && x.data.outputType === 'output'
        }) as NeuronWeightsGene;

        this.brain = new AgentBrain(
            ioWeights.data.weightMatrix,
            ihWeights.data.weightMatrix,
            hoWeights.data.weightMatrix
        );
    }

    public draw(p5 : p5Types, config : IConfigState) {
        p5.push();

        p5.translate(this.position.x, this.position.y);

        if (config.agents.showNames) {
            p5.push();
            p5.textAlign(p5.CENTER);
            p5.textSize(6);
            p5.text(`${this.uuid}`, 0, 20);
            p5.pop();
        }

        p5.rotate(this.rotation);

        p5.push();
        p5.fill(this.color);
        if (this._isMutant) {
            p5.strokeWeight(3);
        }
        p5.circle(0, 0, (this.size * 2));
        p5.pop();

		p5.push();
        p5.fill(255);
		p5.textAlign(p5.CENTER);
		p5.textSize(12);
		p5.text(`${this.numEaten}`, 0, 5);
		p5.pop();

        p5.push();
        p5.angleMode(p5.DEGREES);
        p5.translate(0, -this.size * 1.1);
        p5.rotate(-90);

        const size = 4;
        const x1 = size * p5.cos(0), y1 = size * p5.sin(0);
        const x2 = size * p5.cos(120), y2 = size * p5.sin(120);
        const x3 = size * p5.cos(240), y3 = size * p5.sin(240);

        p5.triangle(x1, y1, x2, y2, x3, y3);
        p5.angleMode(p5.RADIANS);
        p5.pop();

        if (config.showDirection.enabled) {
            p5.line(0, 0, 0, -(this.size * 2));
        }

        this._eyes.forEach( (eye : AgentEye) => {
            p5.push();

            p5.rotate(eye.eyeLocation);
            p5.translate(0, -this.size);
            if (eye.detectedAgent || eye.detectedFood) {
                p5.fill([255, 0, 0]);
            }
            p5.circle(0, 0, 5);

            if (config.showVision.enabled) {
                p5.noStroke();

                if (eye.detectedAgent || eye.detectedFood) {
                    p5.fill(config.showVision.detectedColor);
                } else {
                    p5.fill(config.showVision.color);
                }

                p5.rotate(-Math.PI / 2);
                p5.arc(0, 0, (eye.rangeOfVision * 2), (eye.rangeOfVision * 2), -eye.fieldOfVision / 2, eye.fieldOfVision / 2);
            }

            p5.pop();
        });

        p5.pop();

        const [vel, rot] = this.brain.think(this.getBrainInputs(p5.frameCount));
        const movNormal = new Victor(0, -Math.abs(vel * 2));
        const moveRot = movNormal.rotate(this.rotation);

        this.position = this.position.clone().add(moveRot);

        if (Math.random() > 0.9) {
            this.rotation += (rot / 10);
            //this.rotation += 0.1;
            if (this.rotation > (Math.PI * 2)) {
                this.rotation -= (Math.PI * 2);
            }
        }
    }

    public detect2( agents : Agent[], foods : Food[]) : void {
        const TWO_PI = (2 * Math.PI);
        const PI_OVER_TWO = (Math.PI / 2);

        this._eyes.forEach( (eye : AgentEye) => {
            eye.detectedAgent = null;

            agents.forEach( (agent : Agent) => {
                if (agent.uuid === this.uuid) return;

                const eyePosNorm = new Victor(0, -this.size);
                const eyePos = eyePosNorm.rotate(eye.eyeLocation).add(this.position);
                const eyeDistance = eyePos.distance(agent.position);

                const agentInRadius = (eyeDistance - this.size) < eye.rangeOfVision;

                if (!agentInRadius) return;

                let eyeStart = (this.rotation + eye.eyeLocation) - (eye.fieldOfVision / 2) - PI_OVER_TWO;
                if (eyeStart > TWO_PI) eyeStart -= TWO_PI;
                if (eyeStart < 0) eyeStart += TWO_PI;

                let eyeEnd = (this.rotation + eye.eyeLocation) + (eye.fieldOfVision / 2) - PI_OVER_TWO;
                if (eyeEnd > TWO_PI) eyeEnd -= TWO_PI;
                if (eyeEnd < 0) eyeEnd += TWO_PI;

                let angle = Math.atan2(agent.position.y - eyePos.y, agent.position.x - eyePos.x);
                angle = angle > 0 ? angle : angle + TWO_PI;

                const agentInAngle = eyeStart < eyeEnd ?
                    (eyeStart < angle) && (eyeEnd > angle) :
                    (eyeStart < angle) || (eyeEnd > angle);

                if (agentInAngle && eye.detectedAgent) {
                    const currentDistance = this.position.distance(eye.detectedAgent.position);
                    const newDistance = this.position.distance(agent.position);

                    if (newDistance < currentDistance) {
                        eye.detectedAgent = agent;
                        eye.lastAgentPos = agent.position.clone();
                    }
                } else if (agentInAngle) {
                    eye.detectedAgent = agent;
                    eye.lastAgentPos = agent.position.clone();
                }
            });

            eye.detectedFood = null;

            foods.forEach( (food : Food) => {
                if (food.isEaten) return;

                const eyePosNorm = new Victor(0, -this.size);
                const eyePos = eyePosNorm.rotate(eye.eyeLocation).add(this.position);
                const eyeDistance = eyePos.distance(food.position);

                const foodInRadius = (eyeDistance - 5) < eye.rangeOfVision;

                if (!foodInRadius) return;

                let eyeStart = (this.rotation + eye.eyeLocation) - (eye.fieldOfVision / 2) - PI_OVER_TWO;
                if (eyeStart > TWO_PI) eyeStart -= TWO_PI;
                if (eyeStart < 0) eyeStart += TWO_PI;

                let eyeEnd = (this.rotation + eye.eyeLocation) + (eye.fieldOfVision / 2) - PI_OVER_TWO;
                if (eyeEnd > TWO_PI) eyeEnd -= TWO_PI;
                if (eyeEnd < 0) eyeEnd += TWO_PI;

                let angle = Math.atan2(food.position.y - eyePos.y, food.position.x - eyePos.x);
                angle = angle > 0 ? angle : angle + TWO_PI;

                const foodInAngle = eyeStart < eyeEnd ?
                    (eyeStart < angle) && (eyeEnd > angle) :
                    (eyeStart < angle) || (eyeEnd > angle);

                if (foodInAngle && eye.detectedFood) {
                    const currentDistance = this.position.distance(eye.detectedFood.position);
                    const newDistance = this.position.distance(food.position);

                    if (newDistance < currentDistance) {
                        eye.detectedFood = food;
                        eye.lastFoodPos = food.position.clone();
                    }
                } else if (foodInAngle) {
                    eye.detectedFood = food;
                    eye.lastFoodPos = food.position.clone();
                }
            });
        });
    }

    public foodCheck( foods : Food[]) : void {
        foods.forEach( (food : Food) => {
            const distance = this.position.distance(food.position);

            if (!food.isEaten && distance < this.size) {
                food.isEaten = true;
                this._numEaten += 1;
            }
        });
    }

    private getBrainInputs(frameCount : number) : number[] {
        const inputs : number[][] = [];

        inputs.push([
            rng.real(0, 1),
            frameCount % 250,
            this.position.x,
            this.position.y,
            this.rotation
        ]);

        this._eyes.forEach( (eye : AgentEye) => {
            if (eye.detectedAgent) {
                inputs.push([
                    this.position.distanceX(eye.detectedAgent.position),
                    this.position.distanceY(eye.detectedAgent.position),
                    eye.detectedAgent.rotation
                ]);
            } else {
                inputs.push([0, 0, 0]);
            }

            if (eye.lastAgentPos) {
                inputs.push([
                    eye.lastAgentPos.x,
                    eye.lastAgentPos.y
                ]);
            } else {
                inputs.push([0, 0]);
            }

            if (eye.detectedFood) {
                inputs.push([
                    this.position.distanceX(eye.detectedFood.position),
                    this.position.distanceY(eye.detectedFood.position)
                ]);
            } else {
                inputs.push([0, 0]);
            }

            if (eye.lastFoodPos) {
                inputs.push([
                    eye.lastFoodPos.x,
                    eye.lastFoodPos.y
                ]);
            } else {
                inputs.push([0, 0]);
            }
        });

        return inputs.flat();
    }
}
