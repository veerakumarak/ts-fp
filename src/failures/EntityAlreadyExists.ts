import {Failure} from "../failure";

export class EntityAlreadyExists extends Failure {
    constructor(message: string) {
        super(message);
    }
}

