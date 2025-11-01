import {Failure} from "../failure";

export class AuthFailure extends Failure {
    constructor(message: string) {
        super(message);
    }
}
