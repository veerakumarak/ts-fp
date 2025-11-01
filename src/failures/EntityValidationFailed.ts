import {Failure} from "../failure";

export class EntityValidationFailed extends Failure {
    constructor(message: string) {
        super(message);
    }
}
