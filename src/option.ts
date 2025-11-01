import {Failure} from "./failure";


/**
 * Represents a custom error type encapsulating a cause.
 * Mimics Java's RuntimeException behavior for controlled error handling.
 */
export class Option<T> {
    private readonly value: T | null; // Use 'private readonly' for properties

    // A singleton instance for an "empty" (no) failure
    private static readonly EMPTY_INSTANCE = new Option(null);

    // Private constructor to enforce static factory methods
    // `isInternalEmpty` helps distinguish the actual EMPTY instance from others that might coincidentally have "no failure" message
    constructor(value: T | null) {
        // super(message || "An unknown failure occurred"); // Call Error constructor
        this.value = value;
    }

    /**
     * Static factory method to get the singleton empty failure.
     */
    public static empty<T>(): Option<T> {
        return Option.EMPTY_INSTANCE as Option<T>;
    }

    public static ok<T>(value: T) {
        if (value === undefined || value === null) {
            throw new Error("Option.of received null or undefined. Use Option.orUndefined instead.");
        }
        return new Option(value);
    }

    public static orUndefinedOrNullable<T>(value: T | undefined | null): Option<T> {
        if (value === undefined || value === null) {
            return Option.empty<T>();
        }
        return new Option(value);
    }

    public isOk(): boolean {
        return this.value !== null;
    }

    public isEmpty(): boolean {
        return this.value === null;
    }

    public get(): T {
        if (!this.value) {
            throw new Failure("Attempted to get value from an empty Option.");
        }
        return this.value;
    }

    public getOrElse(defaultValue: T): T {
        return this.value !== null ? this.value : defaultValue;
    }

    public map<U>(mapper: (value: T) => U): Option<U> {
        if (this.value !== null) {
            return Option.ok<U>(mapper(this.value));
        }
        return Option.empty<U>();
    }

    public flatMap<U>(mapper: (value: T) => Option<U>): Option<U> {
        if (this.value !== null) {
            return mapper(this.value);
        }
        return Option.empty<U>();
    }

    public static async of<T>(supplier: () => T | Promise<T>): Promise<Option<T>> {
        if (!supplier) {
            throw new Error("Runnable provided to Failure.of is null/undefined");
        }

        try {
            const result = supplier(); // Execute the supplier

            // Check if the result is a Promise (asynchronously returned value)
            if (result instanceof Promise) {
                const awaitedValue = await result; // Await the promise
                return Option.ok(awaitedValue);
            } else {
                // Synchronously returned value
                return Option.ok(result);
            }
        } catch (error: unknown) {
            return Option.empty();
        }
    }

}