import p5Types from 'p5';
import Victor from 'victor';

import { IConfigState } from '@reducers/ConfigReducer';

interface FoodProps {
    uuid : string;
    position : Victor;
}

export class Food {
    public uuid : string;
    public position : Victor;
    public isEaten : boolean = false;

    constructor(props : FoodProps) {
        this.uuid = props.uuid;
        this.position = props.position;
    }

    public draw(p5 : p5Types) : void {
        if (this.isEaten) return;

        p5.push();

        p5.translate(this.position.x, this.position.y);

        p5.rectMode(p5.RADIUS);
        p5.square(0, 0, 5);

        p5.pop();
    }
}
