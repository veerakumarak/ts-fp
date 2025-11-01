import {Failure} from "../failure";

export class OperationNotAllowed extends Failure {
    constructor(message: string) {
        super(message);
    }
}
