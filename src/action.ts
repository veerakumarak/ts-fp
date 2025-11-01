import type {Failure} from "./failure";
import {IllegalArgument} from "./failures/IllegalArgument";


export interface OkResult<T> {
    readonly isOk: true;
    readonly isFailure: false;
    readonly value: T;
}

export interface InitResult<T> {
    readonly isOk: false;
    readonly isFailure: false;
}

export interface FailureResult<T> {
    readonly isOk: false;
    readonly isFailure: true;
    readonly failure: Failure;
    readonly value?: T; // Explicitly state value is undefined for failure results
}

export type ActionState<T> = OkResult<T> | FailureResult<T> | InitResult<T>;

export function okState<T>(value: T): OkResult<T> {
    // if (value === null || value === undefined) {
    //     throw new IllegalArgument("value cannot be null or undefined for an 'ok' Result.");
    // }
    return { isOk: true, isFailure: false, value };
}

export function initState<T>(): InitResult<T> {
    return { isOk: false, isFailure: false };
}

export function failureState<T>(error: Failure): FailureResult<T> {
    if (error === null || error === undefined) {
        throw new IllegalArgument("Failure object cannot be null or undefined for an error Result.");
    }
    if (error.isEmpty()) {
        throw new IllegalArgument("Cannot create a failure Result with an empty Failure object. Use Result.ok() instead.");
    }
    return { isOk: false, isFailure: true, failure: error };
}

// export class ActionState2 { // Renamed to ResultClass to avoid conflict with `type Result<T>`
//     private readonly success: boolean;
//     private readonly failure: boolean; // Will be undefined if isOk is true
//
//     private constructor(success: boolean, error: boolean) {
//         this.success = success;
//         this.failure = error;
//     }
//
//     public static init(): ActionState {
//         return new ActionState(false, false);
//     }
//
//     public static ok(): ActionState {
//         return new ActionState(true, false);
//     }
//
//     public static failure(): ActionState {
//         return new ActionState(false, true);
//     }
//
//     public isOk(): boolean {
//         return this.success; // Accessing the discriminant property
//     }
//
//     public isFailure(): boolean {
//         return this.failure;
//     }
//
//     public toString(): string {
//         return `Success: ${this.success}, Failure: ${this.failure}`;
//     }
// }
