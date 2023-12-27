import { Random, browserCrypto } from 'random-js';

import { AgentEye } from '@classes/Agent';
import { createRandomEye } from '@factories/AgentFactory';

const rng = new Random(browserCrypto);

interface IAgentGeneProps<T> {
    data : T;
    isMutant ?: boolean;
}

export abstract class AgentGene<T = Record<string, any>> {
    public readonly abstract NAME : string;
    public isMutant : boolean = false;

    protected _data : T;
    get data() : T {
        return this._data;
    }

    constructor(props : IAgentGeneProps<T>) {
        this._data = props.data;
        this.isMutant = !!props.isMutant;
    }

    public abstract crossover(crossGene : AgentGene<T>) : AgentGene<T>;
    public abstract mutate() : AgentGene<T>;
    public abstract copy() : AgentGene<T>;
}

/**
 * The ColorGene is represented as an array of 3 integers in the range 0-255
 * representing an RGB color value.
 *
 * [ red, green, blue]
 */
export type ColorGeneData = [number, number, number];

export class ColorGene extends AgentGene<ColorGeneData> {
    public readonly NAME : string = 'ColorGene';

    private readonly MUTATION_VALUE_RANGE : [number, number] = [-25, 25];

    constructor(props : IAgentGeneProps<ColorGeneData>) {
        super(props);

        this.fixData();
    }

    public crossover(crossGene : ColorGene) : ColorGene {
        const chooseMe = rng.bool();

        return chooseMe ? this.copy() : crossGene.copy();
    }

    public mutate() : ColorGene {
        const randomIndex = rng.integer(0, 2);
        const [minValue, maxValue] = this.MUTATION_VALUE_RANGE;
        const mutationValue = rng.integer(minValue, maxValue);
        const newData = [...this._data] as ColorGeneData;

        newData[randomIndex] += mutationValue;

        return new ColorGene({ data: newData, isMutant: true });
    }

    public copy() : ColorGene {
        return new ColorGene({ data: [...this._data] });
    }

    private fixData() : void {
        this._data = [
            this._data[0] % 255,
            this._data[1] % 255,
            this._data[2] % 255
        ];
    }
}

export class EyeGene extends AgentGene<AgentEye> {
    public readonly NAME : string = 'EyeGene';

    public readonly MUTATION_FOV_RANGE : [number, number] = [ Math.PI / 6, (5 * Math.PI) / 6 ];
    public readonly MUTATION_ROV_RANGE : [number, number] = [ 50, 150 ];
    public readonly MUTATION_LOC_RANGE : [number, number] = [ 0, (2 * Math.PI) ];

    public crossover(crossGene : EyeGene) : EyeGene {
        const chooseMyField = rng.bool();
        const chooseMyRange = rng.bool();
        const chooseMyLocation = rng.bool();

        const newData = {
            fieldOfVision: chooseMyField ? this.data.fieldOfVision : crossGene.data.fieldOfVision,
            rangeOfVision: chooseMyRange ? this.data.rangeOfVision : crossGene.data.rangeOfVision,
            eyeLocation: chooseMyLocation ? this.data.eyeLocation : crossGene.data.eyeLocation,
            canDetect: false
        };

        return new EyeGene({ data: newData });
    }

    public mutate() : EyeGene {
        const mutatableTraits = ['FOV', 'ROV', 'LOC'];
        const chosenTrait = rng.pick(mutatableTraits);

        const [fovMin, fovMax] = this.MUTATION_FOV_RANGE;
        const [rovMin, rovMax] = this.MUTATION_ROV_RANGE;
        const [locMin, locMax] = this.MUTATION_LOC_RANGE;

        const newFov = chosenTrait === 'FOV' ? rng.real(fovMin, fovMax) : this.data.fieldOfVision;
        const newRov = chosenTrait === 'ROV' ? rng.integer(rovMin, rovMax) : this.data.rangeOfVision;
        const newLoc = chosenTrait === 'LOC' ? rng.real(locMin, locMax) : this.data.eyeLocation;

        const newData = {
            fieldOfVision: newFov,
            rangeOfVision: newRov,
            eyeLocation: newLoc,
            canDetect: false,
        };

        return new EyeGene({ data: newData, isMutant: true });
    }

    public copy() : EyeGene {
        return new EyeGene({ data: {...this._data} });
    }
}


export interface NeuronWeightsData {
    inputType : 'input' | 'hidden';
    outputType : 'hidden' | 'output';
    weightMatrix : number[][];
}

export class NeuronWeightsGene extends AgentGene<NeuronWeightsData> {
    public readonly NAME : string = 'NeuronWeightsGene';

    private readonly MUTATION_VALUE_RANGE : [number, number] = [-4, 4];
    private readonly MUTATION_VALUE_HIDDEN_RANGE : [number, number] = [-4, 4];

    public crossover(crossGene : NeuronWeightsGene) : NeuronWeightsGene {
        let big : number[][];
        let small : number[][];

        if (this.data.weightMatrix.length > crossGene.data.weightMatrix.length) {
            big = this.data.weightMatrix;
            small = crossGene.data.weightMatrix;
        } else {
            big = this.data.weightMatrix;
            small = crossGene.data.weightMatrix;
        }

        const newMatrix = big.map( (x : number[], i : number) => {
            if (i < small.length) {
                return this.data.outputType === 'output' ? [
                    rng.bool() ? x[0] : small[i][0],
                    rng.bool() ? x[1] : small[i][1],
                ] : [
                    rng.bool() ? x[0] : small[i][0],
                    rng.bool() ? x[1] : small[i][1],
                    rng.bool() ? x[2] : small[i][2],
                    rng.bool() ? x[3] : small[i][3],
                    rng.bool() ? x[4] : small[i][4],
                    //rng.bool() ? x[5] : small[i][5],
                    //rng.bool() ? x[6] : small[i][6],
                    //rng.bool() ? x[7] : small[i][7],
                    //rng.bool() ? x[8] : small[i][8],
                    //rng.bool() ? x[9] : small[i][9],
                ];
            }

            return x;
        });

        return new NeuronWeightsGene({
            data: {
                inputType: this.data.inputType,
                outputType: this.data.outputType,
                weightMatrix: newMatrix
            }
        });
    }

    public mutate() : NeuronWeightsGene {
        const newMatrix = [...this.data.weightMatrix];

        for (let i = 0; i < rng.integer(1,10); i++) {
            const mutateX = rng.integer(0, this.data.weightMatrix.length - 1);
            const mutateY = rng.integer(0, this.data.weightMatrix[0].length - 1);

            const [min, max] = this.data.outputType === 'hidden' ? this.MUTATION_VALUE_HIDDEN_RANGE : this.MUTATION_VALUE_RANGE;

            newMatrix[mutateX][mutateY] = rng.bool() ? rng.real(min, max) : 0;
        }

        return new NeuronWeightsGene({
            data: {
                inputType: this.data.inputType,
                outputType: this.data.outputType,
                weightMatrix: newMatrix
            },
            isMutant: true
        });
    }

    public copy() : NeuronWeightsGene {
        return new NeuronWeightsGene({ data: {...this._data } });
    }

    public fixToEyeNum(eyeNum : number) : NeuronWeightsGene {
        const newMatrix = [];

        for (let i = 0; i < (eyeNum * 9) + 5; i++) {
            if (this.data.weightMatrix[i]) {
                newMatrix.push(this.data.weightMatrix[i]);
            } else {
                const [min, max] = this.data.outputType === 'hidden' ?
                    this.MUTATION_VALUE_HIDDEN_RANGE :
                    this.MUTATION_VALUE_RANGE;

                if (this.data.outputType === 'output') {
                    newMatrix.push([
                        rng.real(min, max),
                        rng.real(min, max)
                    ]);
                } else if(this.data.outputType === 'hidden') {
                    newMatrix.push([0, 0, 0, 0, 0]);
                    //newMatrix.push([
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max),
                        //rng.real(min, max)
                    //]);
                }
            }
        }

        return new NeuronWeightsGene({
            data: {
                inputType: this.data.inputType,
                outputType: this.data.outputType,
                weightMatrix: newMatrix
            },
            isMutant: this.isMutant
        });
    }
}

export class AgentGenome {
    private _genes : AgentGene[];

    constructor(genes ?: AgentGene[]) {
        this._genes = genes || [];
    }

    public addGene(gene : AgentGene) : AgentGenome {
        this._genes.push(gene);

        return this;
    }

    public getAllGenesOfName(name : string) : AgentGene[] {
        return this._genes.filter(x => x.NAME === name);
    }

    public getAllMutants() : AgentGene[] {
        return this._genes.filter(x => x.isMutant);
    }

    public breedWith(genome : AgentGenome, mutationChance : number) : AgentGenome {
        const parent1_color : ColorGene = this.getAllGenesOfName('ColorGene')[0] as ColorGene;
        const parent2_color : ColorGene = genome.getAllGenesOfName('ColorGene')[0] as ColorGene;
        let childColor : ColorGene = parent1_color.crossover(parent2_color);
        if (rng.bool(mutationChance)) childColor = childColor.mutate();

        const parent1_eyes : EyeGene[] = this.getAllGenesOfName('EyeGene') as EyeGene[];
        const parent2_eyes : EyeGene[] = genome.getAllGenesOfName('EyeGene') as EyeGene[];
        const childNumEyes = rng.bool() ? parent1_eyes.length : parent2_eyes.length;
        let childEyes : EyeGene[] = [];

        for( let i = 0; i < childNumEyes; i++ ) {
            const parent1_eye = parent1_eyes[i];
            const parent2_eye = parent2_eyes[i];

            if (parent1_eye && parent2_eye) {
                childEyes.push(parent1_eye.crossover(parent2_eye));
            } else if(parent1_eye) {
                childEyes.push(parent1_eye);
            } else if(parent2_eye) {
                childEyes.push(parent2_eye);
            }
        }

        if (rng.bool(mutationChance / 2)) {
            if (rng.bool()) {
                childEyes.push(new EyeGene({ data: createRandomEye() }));
            } else {
                childEyes.pop();
            }
        }

        childEyes = childEyes.map( (eye : EyeGene) => {
            return rng.bool(mutationChance) ? eye.mutate() : eye;
        });

        const parent1_nWeights : NeuronWeightsGene = this.getAllGenesOfName('NeuronWeightsGene')[0] as NeuronWeightsGene;
        const parent2_nWeights : NeuronWeightsGene = genome.getAllGenesOfName('NeuronWeightsGene')[0] as NeuronWeightsGene;
        let child_nWeights : NeuronWeightsGene = parent1_nWeights.crossover(parent2_nWeights);
        if (rng.bool(mutationChance)) child_nWeights.mutate();

        const parent1_nwGenes = this.getAllGenesOfName('NeuronWeightsGene') as NeuronWeightsGene[];
        const parent2_nwGenes = genome.getAllGenesOfName('NeuronWeightsGene') as NeuronWeightsGene[];

        const parent1_ioWeights : NeuronWeightsGene = parent1_nwGenes.find( x => {
            return x.data.inputType === 'input' && x.data.outputType === 'output';
        }) as NeuronWeightsGene;
        const parent2_ioWeights : NeuronWeightsGene = parent2_nwGenes.find( x => {
            return x.data.inputType === 'input' && x.data.outputType === 'output';
        }) as NeuronWeightsGene;
        let child_ioWeights : NeuronWeightsGene = parent1_ioWeights.crossover(parent2_ioWeights);

        if (rng.bool(mutationChance)) child_ioWeights = child_ioWeights.mutate();
        child_ioWeights = child_ioWeights.fixToEyeNum(childEyes.length);

        const parent1_ihWeights : NeuronWeightsGene = parent1_nwGenes.find( x => {
            return x.data.inputType === 'input' && x.data.outputType === 'hidden';
        }) as NeuronWeightsGene;
        const parent2_ihWeights : NeuronWeightsGene = parent2_nwGenes.find( x => {
            return x.data.inputType === 'input' && x.data.outputType === 'hidden';
        }) as NeuronWeightsGene;
        let child_ihWeights : NeuronWeightsGene = parent1_ihWeights.crossover(parent2_ihWeights);

        if (rng.bool(mutationChance)) child_ihWeights = child_ihWeights.mutate();
        child_ihWeights = child_ihWeights.fixToEyeNum(childEyes.length);

        const parent1_hoWeights : NeuronWeightsGene = parent1_nwGenes.find( x => {
            return x.data.inputType === 'hidden' && x.data.outputType === 'output';
        }) as NeuronWeightsGene;
        const parent2_hoWeights : NeuronWeightsGene = parent2_nwGenes.find( x => {
            return x.data.inputType === 'hidden' && x.data.outputType === 'output';
        }) as NeuronWeightsGene;
        let child_hoWeights : NeuronWeightsGene = parent1_hoWeights.crossover(parent2_hoWeights);

        if (rng.bool(mutationChance)) child_hoWeights = child_hoWeights.mutate();

        return new AgentGenome([
            childColor,
            ...childEyes,
            child_ioWeights,
            child_ihWeights,
            child_hoWeights
        ]);
    }
}
