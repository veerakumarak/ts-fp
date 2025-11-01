import {Failure} from "../failure";

export class IllegalState extends Failure {
    constructor(message: string) {
        super(message);
    }
}
