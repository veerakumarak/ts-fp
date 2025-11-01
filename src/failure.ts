/**
 * Represents a custom error type encapsulating a cause.
 * Mimics Java's RuntimeException behavior for controlled error handling.
 */
export class Failure extends Error {
    // private readonly _message: string; // Use 'private readonly' for properties
    private readonly _cause?: unknown; // Use 'private readonly' for properties

    // A singleton instance for an "empty" (no) failure
    private static readonly EMPTY_INSTANCE: Failure = new Failure(
        'no failure',
        undefined
    );

    // Private constructor to enforce static factory methods
    // `isInternalEmpty` helps distinguish the actual EMPTY instance from others that might coincidentally have "no failure" message
    constructor(message: string, cause?: unknown) {
        super(message || "An unknown failure occurred"); // Call Error constructor
        // this._message = message;
        this._cause = cause;

        // Correctly restore the prototype chain *if necessary* for older environments.
        // For modern JS/TS targets (ES6+), this line is often not needed
        // but can be kept as a safeguard for wider compatibility.
        // It should be after super() call.
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, Failure); // Captures a clean stack trace
        } else {
            // Fallback for environments that don't support captureStackTrace
            Object.setPrototypeOf(this, Failure.prototype);
        }
    }

    /**
     * Static factory method to get the singleton empty failure.
     */
    public static empty(): Failure {
        return Failure.EMPTY_INSTANCE;
    }

    /**
     * Static factory method to create a new Failure instance.
     * @param message A message describing the failure.
     * @param cause The underlying cause of the failure (can be another Error, string, or any value).
     */
    public static wrap(message: string, cause?: unknown): Failure {
        return new Failure(message, cause);
    }

    /**
     * Static factory method to create a new Failure instance from a message.
     * @param message A message describing the failure.
     */
    public static ofMessage(message: string): Failure {
        return new Failure(message);
    }

    /**
     * Static factory method to create a Failure by wrapping a Throwable (Error).
     * If the cause is already a Failure, it might unwrap it.
     * @param cause The underlying cause of the failure.
     * @param message Optional message to override the cause's message.
     */
    public static fromCause(cause: unknown, message?: string): Failure {
        // If the cause is already a Failure instance, unwrap it if it's not the EMPTY instance
        if (Failure.isFailure(cause) && cause.isPresent()) {
            return cause; // Or new Failure(message || cause.message, cause) if you want to wrap
        }
        // Try to get a meaningful message from the cause if no message is provided
        const effectiveMessage = message || (cause instanceof Error ? cause.message : String(cause || 'unknown cause'));
        return new Failure(effectiveMessage, cause);
    }


    /**
     * Overrides the Error.message getter to provide more robust message logic.
     * Prioritizes own message, then cause's message, then a default.
     */
    // public message(): string {
    //     return super.message;
    // }

    /**
     * Gets the underlying cause of this failure.
     */
    public get cause(): unknown | undefined {
        return this._cause;
    }

    /**
     * Unwraps nested Failure instances. If the cause is a Failure, returns that.
     * Otherwise, returns itself.
     */
    public unwrap(): Failure {
        if (Failure.isFailure(this._cause) && this._cause.isPresent()) {
            return this._cause;
        }
        return this; // no further unwrapping possible
    }

    /**
     * Throws this Failure instance if it represents an actual error (i.e., not the EMPTY instance).
     */
    public orThrow(): void {
        if (this.isPresent()) {
            throw this;
        }
    }

    /**
     * Checks if this Failure instance represents an actual error.
     * @returns `true` if it's an error, `false` if it's the empty failure.
     */
    public isPresent(): boolean {
        // Use the internal flag for accurate EMPTY instance check
        return !this.isEmpty(); // Check if *this* instance is the EMPTY singleton
    }

    /**
     * Checks if this Failure instance is the empty failure.
     * @returns `true` if it's the empty failure, `false` if it's an error.
     */
    public isEmpty(): boolean {
        return this === Failure.EMPTY_INSTANCE;
    }

    /**
     * Checks if this Failure instance is of a specific class (or a subclass).
     * @param failureClass The constructor of the Failure class to check against.
     * @returns `true` if it's present and an instance of the given class, `false` otherwise.
     */
    // public isEq(failureClass: new (...args: any[]) => Failure): boolean {
    //     if (!failureClass) {
    //         throw new Error("Class provided to isEq is null/undefined"); // Mimic NullPointerException
    //     }
    //     return this.isPresent() && this instanceof failureClass;
    // }

    /**
     * Executes an action if this Failure instance represents an actual error.
     * @param action The consumer function to execute with the Failure instance.
     */
    public ifPresent(action: (failure: Failure) => void): void {
        if (!action) {
            throw new Error("Action provided to ifPresent is null/undefined");
        }
        if (this.isPresent()) {
            action(this);
        }
    }

    /**
     * Executes a runnable if this Failure instance is the empty failure.
     * @param runnable The function to execute.
     */
    public ifEmpty(runnable: () => void): void {
        if (!runnable) {
            throw new Error("Runnable provided to ifEmpty is null/undefined");
        }
        if (this.isEmpty()) {
            runnable();
        }
    }

    /**
     * Executes an action if this Failure instance represents an actual error, then returns itself.
     * Useful for logging or debugging in a chained context.
     * @param action The consumer function to execute with the Failure instance.
     */
    public inspectPresent(action: (failure: Failure) => void): Failure {
        this.ifPresent(action);
        return this;
    }

    /**
     * Executes a runnable if this Failure instance is the empty failure, then returns itself.
     * Useful for logging or debugging in a chained context.
     * @param runnable The function to execute.
     */
    public inspectEmpty(runnable: () => void): Failure {
        this.ifEmpty(runnable);
        return this;
    }

    /**
     * Static method to create a Failure instance by running a function in a try-catch block.
     * @param runnable The function to execute.
     * @returns A Failure instance if an error occurred, or the empty Failure if successful.
     */
    public static async of(runnable: () => void | Promise<void>): Promise<Failure> {
        if (!runnable) {
            throw new Error("Runnable provided to Failure.of is null/undefined");
        }

        try {
            const result = runnable(); // Execute the supplier

            // Check if the result is a Promise (asynchronously returned value)
            if (result instanceof Promise) {
                await result; // Await the promise
            }
            return Failure.empty();
        } catch (error: unknown) { // Catch `unknown` as errors can be anything in JS
            let errorMessage: string;
            if (error instanceof Error && error.message && error.message.trim() !== '') {
                errorMessage = error.message;
            } else if (typeof error === 'string' && error.trim() !== '') {
                errorMessage = error;
            } else {
                errorMessage = "An unexpected error occurred during runnable execution.";
            }
            return Failure.wrap(errorMessage, error);
        }
    }

    /**
     * Overrides Object.equals for value comparison.
     */
    public equals(other: unknown): boolean {
        if (other === this) return true; // Identity check
        if (!(other instanceof Failure)) return false; // Not a Failure instance

        // Special handling for the EMPTY instance for consistent behavior with Java's identity check
        if (this.isEmpty() || other.isEmpty()) {
            // If one is EMPTY, and they are not the same instance (covered by `this === other`),
            // then they are not equal.
            // This assumes EMPTY should only equal itself.
            return this.isEmpty() && other.isEmpty(); // Only equal if both are EMPTY
        }

        // Compare messages and causes for non-empty failures
        return this.message === other.message && this._cause === other._cause;
    }

    /**
     * Helper for type guarding.
     * @param obj The object to check.
     * @returns `true` if the object is an instance of Failure, `false` otherwise.
     */
    public static isFailure(obj: unknown): obj is Failure {
        return obj instanceof Failure;
    }

    /**
     * Checks if this Failure instance is of a specific class (or a subclass).
     * @param failureClass The constructor of the Failure class to check against.
     * @returns `true` if it's present and an instance of the given class, `false` otherwise.
     */
    public isA<T extends Failure>(failureClass: new (...args: any[]) => T): this is T {
        if (!failureClass) {
            throw new Error("Class provided to isA is null/undefined");
        }
        return this.isPresent() && this instanceof failureClass;
    }

    // Note: hashCode is less common/critical in JS/TS without specific needs for hash-based collections
    // If needed, you could implement a simple hash:
    // public hashCode(): number {
    //   if (this.isEmpty()) {
    //     return 0; // Or some consistent hash for EMPTY
    //   }
    //   // Simple string hashing based on message and stringified cause
    //   let hash = 0;
    //   if (this.message) {
    //       for (let i = 0; i < this.message.length; i++) {
    //           const char = this.message.charCodeAt(i);
    //           hash = (hash << 5) - hash + char;
    //           hash |= 0; // Convert to 32bit integer
    //       }
    //   }
    //   if (this._cause) {
    //       const causeStr = String(this._cause);
    //       for (let i = 0; i < causeStr.length; i++) {
    //           const char = causeStr.charCodeAt(i);
    //           hash = (hash << 5) - hash + char;
    //           hash |= 0; // Convert to 32bit integer
    //       }
    //   }
    //   return hash;
    // }

    /**
     * Overrides Object.toString for a custom string representation.
     */
    public toString(): string {
        if (this.isEmpty()) {
            return "Failure.EMPTY";
        }

        let result = `${this.constructor.name}{message='${this.message}'`; // Use constructor.name for dynamic class name
        if (this._cause !== undefined && this._cause !== this) { // Avoid infinite recursion
            let causeDetails = '';
            if (this._cause instanceof Error) {
                causeDetails = `${this._cause.constructor.name}('${this._cause.message}')`;
            } else {
                causeDetails = `'${String(this._cause)}'`;
            }
            result += `, cause=${causeDetails}`;
        }
        result += '}';
        return result;
    }
}

// Example usage:
(async () => {
    try {
        // ✅ Example 1: Success scenario (no failure)
        const successResult = await Failure.of(() => console.log("Operation successful!"));
        successResult.ifEmpty(() => console.log("No failure occurred after runnable."));
        successResult.inspectPresent(() => console.log("This should NOT print (inspectPresent)"));
        successResult.inspectEmpty(() => console.log("This should print (inspectEmpty)"));

        // ✅ Example 2: Error scenario
        const errorResult = await Failure.of(() => {
            throw new Error("Something went wrong!");
        });
        errorResult.ifPresent((f) => console.error("Failure occurred:", f.message, f.cause));
        // errorResult.orThrow(); // Uncomment to rethrow

        // ✅ Example 3: Custom wrapped error
        const customErrorResult = Failure.wrap("Specific issue", new TypeError("Invalid type provided"));
        console.log(customErrorResult.message); // Output: Specific issue
        console.log(customErrorResult.cause); // Output: TypeError: Invalid type provided
        console.log(customErrorResult.toString()); // Failure{message='Specific issue', cause=TypeError('Invalid type provided')}

        // ✅ Example 4: Nested error unwrapping
        const nestedError = Failure.wrap("Outer error", Failure.ofMessage("Inner error"));
        console.log("Nested error (unwrap):", nestedError.unwrap().message); // Output: Inner error

        // ✅ Example 5: Empty instance checks
        const empty = Failure.empty();
        console.log("Is empty:", empty.isEmpty()); // true
        console.log("Is present:", empty.isPresent()); // false
        console.log("Is equal to EMPTY:", empty.equals(Failure.empty())); // true
        console.log(empty.toString()); // Output: Failure.EMPTY

        // ✅ Example 6: Subclass usage
        class NetworkFailure extends Failure {}
        const netError = new NetworkFailure("Network disconnected");
        console.log("Is NetworkFailure:", netError.isA(NetworkFailure)); // true
        console.log("Is general Failure:", netError.isA(Failure)); // true

    } catch (e) {
        console.error("Caught an error outside of Failure handling:", e);
    }
})();
