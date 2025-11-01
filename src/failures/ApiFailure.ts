import {Failure} from "../failure";

export class ApiFailure extends Failure {
    constructor(message: string) {
        super(message);
    }
}
