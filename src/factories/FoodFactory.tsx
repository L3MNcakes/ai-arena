import Victor from 'victor';
import { Random, browserCrypto } from 'random-js';

import { Food } from '@classes/Food';
import { IConfigState } from '@reducers/ConfigReducer';

const rng = new Random(browserCrypto);

export const createRandomFood = (
    config : IConfigState
) : Food => {
    const uuid = rng.uuid4();

    const position = new Victor(
        rng.integer(100, config.worldSize.width - 100),
        rng.integer(100, config.worldSize.height - 100)
    );

    return new Food({ uuid, position });
};
