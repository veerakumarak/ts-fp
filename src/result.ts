// failure.ts (Assuming your previous Failure class is here)
// Make sure your Failure class is exported, e.g., `export class Failure extends Error { ... }`
// And its static methods like `Failure.empty()` and `Failure.wrap()` are available.
import { Failure } from './failure'; // Adjust path as necessary
import { IllegalArgument } from './failures/IllegalArgument';

/**
 * Represents the successful outcome of an operation.
 * Contains the value of type T.
 */
// interface OkResult<T> {
//     readonly isOk: true;
//     readonly isFailure: false;
//     readonly value: T;
// }

/**
 * Represents the failed outcome of an operation.
 * Contains the Failure object.
 */
// interface FailureResult<T> {
//     readonly isOk: false;
//     readonly isFailure: true;
//     readonly failure: Failure;
//     readonly value?: undefined; // Explicitly state value is undefined for failure results
// }

/**
 * A type representing an operation that can either succeed with a value of type T
 * or fail with a Failure object.
 * @template T The type of the successful value.
 */
// export type Result<T> = OkResult<T> | FailureResult<T>;

/**
 * Helper function to create an 'Ok' Result.
 * @param value The successful value.
 * @returns A Result in the success state.
 */
// function ok<T>(value: T): OkResult<T> {
//     // Mimic Java's Objects.requireNonNull for the value
//     if (value === null || value === undefined) {
//         throw new IllegalArgument("Value cannot be null or undefined for an 'ok' Result.");
//     }
//     return { isOk: true, isFailure: false, value };
// }

/**
 * Helper function to create a 'Failure' Result.
 * @param error The Failure object.
 * @returns A Result in the failure state.
 */
// function failure<T>(error: Failure): FailureResult<T> {
//     // Mimic Java's Objects.requireNonNull for the failure
//     if (error === null || error === undefined) {
//         throw new IllegalArgument("Failure object cannot be null or undefined for an error Result.");
//     }
//     if (error.isEmpty()) {
//         throw new IllegalArgument("Cannot create a failure Result with an empty Failure object. Use Result.ok() instead.");
//     }
//     return { isOk: false, isFailure: true, failure: error };
// }

/**
 * The `Result` class provides a type-safe way to handle operations that can
 * either return a successful value or an error (represented by a `Failure` object).
 * It enforces explicit error handling, similar to Rust's `Result` enum.
 * @template T The type of the successful value.
 */
export class Result<T> { // Renamed to ResultClass to avoid conflict with `type Result<T>`
    private readonly _value?: T | undefined;
    private readonly _failure?: Failure | undefined; // Will be undefined if isOk is true

    private constructor(failure?: Failure, value?: T) {
        this._value = value;
        this._failure = failure;
    }

    /**
     * Creates a successful Result.
     * @param value The successful value.
     * @returns A Result in the success state.
     */
    public static ok<T>(value: T): Result<T> {
        return new Result<T>(undefined, value);
    }

    /**
     * Creates a failed Result with a Failure object.
     * @param failure The Failure object.
     * @returns A Result in the failure state.
     */
    public static failure<T>(failure: Failure): Result<T> {
        return new Result<T>(failure, undefined);
    }

    /**
     * Creates a failed Result with a message, wrapping it in a default Failure.
     * @param message The error message.
     * @returns A Result in the failure state.
     */
    public static failureWithMessage<T>(message: string): Result<T> {
        return Result.failure(Failure.ofMessage(message));
    }

    /**
     * Checks if the Result is in a successful state.
     */
    public isOk(): boolean {
        return this._failure === undefined; // Accessing the discriminant property
    }

    /**
     * Checks if the Result is in a failure state.
     */
    public isFailure(): boolean {
        return this._failure !== undefined;
    }

    /**
     * Checks if the failure in the Result is of a specific Failure class.
     * Only applicable if the Result is in a failure state.
     * @param failureClass The constructor of the Failure class to check against.
     * @returns `true` if it's a failure and matches the class, `false` otherwise.
     */
    // public isErrorEq(failureClass: new (...args: any[]) => Failure): boolean {
    //     return this.isFailure && (this as FailureResult<T>).failure.isEq(failureClass);
    // }

    /**
     * Gets the Failure object if the Result is in a failure state.
     * Throws an IllegalArgument if called on a successful Result.
     */
    public failure(): Failure {
        if (this.isOk()) {
            throw new IllegalArgument("Cannot get failure from a successful Result.");
        }
        return this._failure ? this._failure : Failure.empty();
    }

    /**
     * Returns the value if the Result is successful; otherwise, throws the encapsulated failure.
     * @param message An optional message to prepend to the thrown error's message.
     * @returns The successful value.
     */
    public expect(message: string): T {
        if (!this._value) {
            throw Failure.wrap(`${message}: ${this._failure?.message}`, this._failure);
        }
        return this._value;
    }

    /**
     * Returns the value if the Result is successful; otherwise, throws the encapsulated failure.
     * This is equivalent to `expect("No value present, Result is in a failure state.")`.
     * @returns The successful value.
     */
    public get(): T {
        return this.expect("No value present, Result is in a failure state.");
    }

    /**
     * Returns the value if the Result is successful; otherwise, returns a default value.
     * @param defaultValue The value to return if the Result is a failure.
     * @returns The successful value or the default value.
     */
    // public orElse(defaultValue: T): T {
    //     return this.isOk() ? (this as OkResult<T>).value : defaultValue;
    // }

    /**
     * Returns the value if the Result is successful; otherwise, invokes a supplier to get a default value.
     * @param supplier A function that supplies the default value if the Result is a failure.
     * @returns The successful value or the value from the supplier.
     */
    // public orElseGet(supplier: () => T): T {
    //     if (!supplier) {
    //         throw new IllegalArgument("Supplier provided to orElseGet is null/undefined");
    //     }
    //     return this.isOk() ? (this as OkResult<T>).value : supplier();
    // }

    /**
     * Returns the value if the Result is successful; otherwise, throws the encapsulated failure.
     * @returns The successful value.
     * @throws The encapsulated Failure object if the Result is in a failure state.
     */
    // public orElseThrow(): T {
    //     if (this.isFailure()) {
    //         throw (this as FailureResult<T>).failure;
    //     }
    //     return (this as OkResult<T>).value;
    // }

    /**
     * Returns the value if the Result is successful; otherwise, throws an exception provided by a supplier.
     * @param exceptionSupplier A function that supplies the exception to throw if the Result is a failure.
     * @returns The successful value.
     * @throws An exception provided by the supplier.
     */
    // public orElseThrowException<X extends Error>(exceptionSupplier: () => X): T {
    //     if (!exceptionSupplier) {
    //         throw new IllegalArgument("Exception supplier provided to orElseThrowException is null/undefined");
    //     }
    //     if (this.isFailure()) {
    //         throw exceptionSupplier();
    //     }
    //     return (this as OkResult<T>).value;
    // }

    /**
     * Executes an action if the Result is in a successful state.
     * @param action The function to execute with the successful value.
     */
    public ifOk(action: (value: T) => void): void {
        if (!action) {
            throw new IllegalArgument("Action provided to ifOk is null/undefined");
        }
        if (this._value) {
            action(this._value);
        }
    }

    /**
     * Executes an action if the Result is in a failure state.
     * @param action The function to execute with the Failure object.
     */
    public ifFailure(action: (failure: Failure) => void): void {
        if (!action) {
            throw new IllegalArgument("Action provided to ifFailure is null/undefined");
        }
        if (this.isFailure()) {
            action(this._failure ? this._failure : Failure.empty());
        }
    }

    /**
     * Executes an action if the Result is in a successful state, then returns itself.
     * Useful for logging or debugging in a chained context.
     * @param action The function to execute with the successful value.
     */
    public inspectOk(action: (value: T) => void): Result<T> {
        this.ifOk(action);
        return this as Result<T>;
    }

    /**
     * Executes an action if the Result is in a failure state, then returns itself.
     * Useful for logging or debugging in a chained context.
     * @param action The function to execute with the Failure object.
     */
    public inspectFailure(action: (failure: Failure) => void): Result<T> {
        this.ifFailure(action);
        return this as Result<T>;
    }

    /**
     * Creates a Result by running a supplier function in a try-catch block.
     * @param supplier The function to execute that returns a value.
     * @returns A successful Result with the value, or a failed Result if an error occurred.
     */
    // public static of<T>(supplier: () => T): Result<T> {
    //     if (!supplier) {
    //         throw new IllegalArgument("Supplier provided to Result.of is null/undefined");
    //     }
    //     try {
    //         return Result.ok(supplier());
    //     } catch (error: unknown) {
    //         let errorMessage: string;
    //         if (error instanceof Error && error.message && error.message.trim() !== '') {
    //             errorMessage = error.message;
    //         } else if (typeof error === 'string' && error.trim() !== '') {
    //             errorMessage = error;
    //         } else {
    //             errorMessage = "An unexpected error occurred during supplier execution.";
    //         }
    //         return Result.failure(Failure.wrap(errorMessage, error));
    //     }
    // }
    //
    public static async of<T>(supplier: () => T | Promise<T>): Promise<Result<T>> {
        if (!supplier) {
            return Result.failure(new IllegalArgument("Supplier provided to Result.of is null/undefined"));
        }

        try {
            const result = supplier(); // Execute the supplier

            // Check if the result is a Promise (asynchronously returned value)
            if (result instanceof Promise) {
                const awaitedValue = await result; // Await the promise
                return Result.ok(awaitedValue);
            } else {
                // Synchronously returned value
                return Result.ok(result);
            }
        } catch (error: unknown) {
            // console.log(error);
            // Catch any errors (synchronous throw or Promise rejection)
            let errorMessage: string;
            if (error instanceof Error && error.message && error.message.trim() !== '') {
                errorMessage = error.message;
            } else if (typeof error === 'string' && error.trim() !== '') {
                errorMessage = error;
            } else if (error instanceof Failure) {
                errorMessage = error.message;
            } else {
                errorMessage = "An unexpected error occurred during supplier execution.";
            }
            return Result.failure(Failure.wrap(errorMessage, error));
        }
    }


/**
     * Transforms the successful value of the Result using a mapper function.
     * If the Result is a failure, it remains a failure.
     * If the mapper throws an error, the Result becomes a failure.
     * @param mapper A function that transforms the successful value.
     * @returns A new Result with the transformed value or the original failure.
     */
    public map<U>(mapper: (value: T) => U): Result<U> {
        if (!mapper) {
            throw new IllegalArgument("Mapper provided to map is null/undefined");
        }
        if (!this._value) {
            return Result.failure<U>(this._failure ? this._failure : Failure.ofMessage("this is never called"));
        } else {
            try {
                return Result.ok(mapper(this._value));
            } catch (error: unknown) {
                let errorMessage: string;
                if (error instanceof Error && error.message && error.message.trim() !== '') {
                    errorMessage = error.message;
                } else if (typeof error === 'string' && error.trim() !== '') {
                    errorMessage = error;
                } else {
                    errorMessage = "An error occurred during mapping.";
                }
                return Result.failure(Failure.wrap(errorMessage, error));
            }
        }
    }

    /**
     * Chains operations that return a Result.
     * If the current Result is a failure, it remains a failure.
     * If the current Result is successful, the mapper function is applied.
     * If the mapper throws an error, the Result becomes a failure.
     * @param mapper A function that takes the successful value and returns a new Result.
     * @returns A new Result from the mapper function or the original failure.
     */
    public flatMap<U>(mapper: (value: T) => Result<U>): Result<U> {
        if (!mapper) {
            throw new IllegalArgument("Mapper provided to flatMap is null/undefined");
        }
        if (!this._value) {
            return Result.failure<U>(this._failure ? this._failure : Failure.ofMessage("this is never called"));
        } else {
            try {
                return mapper(this._value);
            } catch (error: unknown) {
                let errorMessage: string;
                if (error instanceof Error && error.message && error.message.trim() !== '') {
                    errorMessage = error.message;
                } else if (typeof error === 'string' && error.trim() !== '') {
                    errorMessage = error;
                } else {
                    errorMessage = "An error occurred during flatMapping.";
                }
                return Result.failure(Failure.wrap(errorMessage, error));
            }
        }
    }

    /**
     * Overrides Object.equals for value comparison.
     * Compares values if both are successful, or failures if both are failures.
     */
    // public equals(other: unknown): boolean {
    //     if (this === other) return true;
    //     if (!(other instanceof Result)) return false;
    //
    //     // Use the discriminant properties for type narrowing
    //     if (this.isOk() && other.isOk()) {
    //         return this.value === other.value; // Simple value comparison
    //     } else if (this.isFailure() && other.isFailure()) {
    //         // Compare the underlying Failure objects using their equals method
    //         return this.failure.equals(other.failure);
    //     }
    //     return false; // One is Ok, one is Failure
    // }

    // Note: hashCode is less common/critical in JS/TS without specific needs for hash-based collections
    // If needed, you could implement a simple hash based on value or failure.

    /**
     * Provides a string representation of the Result.
     */
    public toString(): string {
        if (this.isOk()) {
            return `Result.Ok(${JSON.stringify(this._value)})`;
        } else {
            return `Result.Failure(${this._failure?.toString()})`;
        }
    }
}

// --- Helper Functions for easier Result creation and type guarding ---
// These functions are what you'd typically import and use directly.
// They return the discriminated union type `Result<T>`.

/**
 * Creates a successful Result.
 * @param value The successful value.
 * @returns A Result in the success state.
 */
export function okResult<T>(value: T): Result<T> {
    return Result.ok(value);
}

/**
 * Creates a failed Result with a Failure object.
 * @param error The Failure object.
 * @returns A Result in the failure state.
 */
export function failureResult<T>(error: Failure): Result<T> {
    return Result.failure(error);
}

/**
 * Creates a failed Result with a message, wrapping it in a default Failure.
 * @param message The error message.
 * @returns A Result in the failure state.
 */
export function failureResultWithMessage<T>(message: string): Result<T> {
    return Result.failureWithMessage(message);
}

/**
 * Creates a Result by running a supplier function in a try-catch block.
 * @param supplier The function to execute that returns a value.
 * @returns A successful Result with the value, or a failed Result if an error occurred.
 */
export function resultOf<T>(supplier: () => T): Promise<Result<T>> {
    return Result.of(supplier);
}

// --- Example Usage ---
//
// function divide(a: number, b: number): Result<number> {
//     if (b === 0) {
//         return failureResult(Failure.ofMessage("Division by zero is not allowed."));
//     }
//     return okResult(a / b);
// }
//
// console.log("\n--- Basic Usage ---");
// const res1 = divide(10, 2);
// if (res1.isOk()) {
//     res1.ifOk((v) => console.log("Success:", v)); // Success: 5
// } else {
//     res1.ifFailure((f) => console.error("Error:", f.message));
// }
//
// const res2 = divide(10, 0);
// if (res2.isFailure()) {
//     res2.ifFailure((f) => console.error("Error:", f.message)); // Error: Division by zero is not allowed.
// } else {
//     res2.ifOk((v) => console.log("Success:", v));
// }
//
// console.log("\n--- Expect / Get ---");
// try {
//     const val1 = okResult(100).expect("Expected value");
//     console.log("Expected value:", val1); // Expected value: 100
// } catch (e) {
//     console.error("Caught expected error:", (e as Error).message);
// }
//
// console.log("\n--- Defaulting with map/fallback ---");
// const res3 = divide(20, 0);
// const safeValue = res3.isOk() ? res3.get() : 0;
// console.log("Safe value:", safeValue); // 0
//
// console.log("\n--- ifOk / ifFailure / inspect ---");
// okResult("data").ifOk((d) => console.log("IfOk:", d)); // IfOk: data
// failureResult<string>(Failure.ofMessage("Oops")).ifFailure((f) => console.error("IfFailure:", f.message)); // IfFailure: Oops
//
// okResult(123)
//     .inspectOk((v) => console.log("InspectOk value:", v)) // InspectOk value: 123
//     .map((v) => v * 2)
//     .inspectOk((v) => console.log("InspectOk doubled value:", v)); // InspectOk doubled value: 246
//
// failureResult<number>(Failure.ofMessage("Chain broken"))
//     .inspectFailure((f) => console.error("InspectFailure:", f.message)) // InspectFailure: Chain broken
//     .map((v) => v * 2) // skipped
//     .inspectOk(() => console.log("This will not print"));
//
// console.log("\n--- Async Result.of ---");
// (async () => {
//     const safeParse = await resultOf<number>(() => {
//         const num = parseInt("42", 10);
//         if (isNaN(num)) throw new Error("Not a number");
//         return num;
//     });
//
//     safeParse.ifOk((n) => console.log("Safely parsed:", n)); // Safely parsed: 42
//
//     const unsafeParse = await resultOf<number>(() => {
//         throw new Error("Parsing failed intentionally");
//     });
//
//     unsafeParse.ifFailure((f) => console.error("Unsafely parsed error:", f.message)); // Unsafely parsed error: Parsing failed intentionally
// })();
//
// console.log("\n--- Map / FlatMap ---");
// const mappedResult = divide(20, 4)
//     .map((num) => num * 10)
//     .map((num) => `Result is ${num}`);
// mappedResult.ifOk((s) => console.log("Mapped Result:", s)); // Mapped Result: Result is 50
//
// const flatMappedResult = divide(100, 10)
//     .flatMap((num) => divide(num, 2))
//     .flatMap((num) => divide(num, 0));
// flatMappedResult.ifFailure((f) => console.error("FlatMapped Result Error:", f.message));
//
// console.log("\n--- toString ---");
// console.log(okResult({ id: 1, name: "Test" }).toString()); // Result.Ok({"id":1,"name":"Test"})
// console.log(failureResult(Failure.ofMessage("Network error")).toString()); // Result.Failure(Failure{message='Network error'})
