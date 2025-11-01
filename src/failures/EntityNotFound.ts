import {Failure} from "../failure";

export class EntityNotFound extends Failure {
    constructor(message: string) {
        super(message);
    }
}
