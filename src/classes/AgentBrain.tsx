import * as tf from '@tensorflow/tfjs';

export class AgentBrain {
    private _neuronWeights : number[][];
    private _ihWeights : number[][];
    private _hoWeights : number[][];
    private _model : tf.LayersModel;

    constructor(
        neuronWeights : number[][],
        ihWeights : number[][],
        hoWeights : number[][]
    ) {
        this._neuronWeights = neuronWeights;
        this._ihWeights = ihWeights;
        this._hoWeights = hoWeights;
        this._model = this._createModel();
    }

    private _createModel() : tf.LayersModel {
        const inputShape : tf.Shape = [ this._neuronWeights.length ];
        const input = tf.input({ shape: inputShape });

        const hidden = tf.layers.dense({
            units: 5,
            activation: 'selu',
            weights: [
                tf.tensor2d(this._ihWeights.flat(), [ this._neuronWeights.length, 5 ]),
                tf.tensor1d([0, 0, 0, 0, 0])
            ]
        }).apply(input) as tf.SymbolicTensor;

        const hiddenOuput = tf.layers.dense({
            units: 2,
            activation: 'selu',
            weights: [
                tf.tensor2d(this._hoWeights.flat(), [ 5, 2 ]),
                tf.tensor1d([0, 0])
            ]
        }).apply(hidden) as tf.SymbolicTensor;

        const output = tf.layers.dense({
            units: 2,
            activation: 'selu',
            weights: [
                tf.tensor2d(this._neuronWeights.flat(), [ this._neuronWeights.length, 2 ]),
                tf.tensor1d([0, 0])
            ]
        }).apply(input) as tf.SymbolicTensor;

        const outputSum = tf.layers.add().apply([hiddenOuput, output]) as tf.SymbolicTensor;

        const model = tf.model({ inputs: input, outputs: outputSum });

        return model;
    }

    public think(inputs : number[]) : Float32Array {
        return tf.tidy( () => {
            const inputTensor = tf.tensor([inputs]);

            const predict = this._model.predict(inputTensor) as tf.Tensor;

            return predict.tanh().dataSync() as Float32Array;
        });
    }
}
