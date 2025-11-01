import {Failure} from "../failure";

export class InternalFailure extends Failure {
    constructor(message: string) {
        super(message);
    }
}
