import {Failure} from "../failure";

export class IllegalArgument extends Failure {
    constructor(message: string) {
        super(message);
    }
}
