import { Failure } from './failure'; // Assuming Failure class is in 'failure.ts'
import { IllegalArgument } from './failures/IllegalArgument'; // Assuming IllegalArgument is in 'IllegalArgument.ts'

/**
 * Returns the singleton empty Failure instance.
 * Equivalent to Java's `Failures.empty()`.
 */
export function emptyFailure(): Failure {
    return Failure.empty();
}

/**
 * Creates a new Failure instance with a specific message.
 * The message cannot be null, undefined, or blank.
 * Equivalent to Java's `Failures.with(String message)`.
 * @param message The error message for the Failure.
 * @returns A new Failure instance.
 * @throws {IllegalArgument} If the message is null, undefined, or blank.
 */
export function failureWithMessage(message: string): Failure {
    if (message === null || message === undefined || message.trim() === '') {
        throw new IllegalArgument("Failure message cannot be null, undefined, or blank when created directly.");
    }
    return Failure.ofMessage(message); // Using the static factory method on Failure
}

/**
 * Wraps an underlying cause (Error or any value) with an optional message into a Failure instance.
 * Provides default messages if the provided message or cause's message is empty.
 * Equivalent to Java's `Failures.wrap(String message, Throwable cause)`.
 * @param message An optional message for the Failure. If null or blank, attempts to use cause's message or a default.
 * @param cause The underlying cause of the failure (can be an Error, another Failure, or any value).
 * @returns A new Failure instance.
 */
export function wrapFailure(message: string | null | undefined, cause: unknown): Failure {
    let finalMessage: string | undefined;

    // Prioritize provided message if valid
    if (message && message.trim() !== '') {
        finalMessage = message;
    } else if (cause instanceof Error && cause.message && cause.message.trim() !== '') {
        // Fallback to cause's message if valid
        finalMessage = cause.message;
    } else {
        // Final fallback
        finalMessage = "An unexpected error occurred.";
    }

    return Failure.wrap(finalMessage, cause); // Using the static factory method on Failure
}

/**
 * Wraps an existing Failure instance with an optional new message.
 * Equivalent to Java's `Failures.wrap(String message, Failure failure)`.
 * @param message An optional message for the new Failure. If null or blank, attempts to use the original failure's message.
 * @param originalFailure The original Failure instance to wrap.
 * @returns A new Failure instance, potentially wrapping the original.
 * @throws {IllegalArgument} If the originalFailure is null or undefined.
 */
export function wrapExistingFailure(message: string | null | undefined, originalFailure: Failure): Failure {
    if (originalFailure === null || originalFailure === undefined) {
        throw new IllegalArgument("Original failure to wrap cannot be null or undefined.");
    }
    // The Java version casts to Throwable, which is handled naturally by `wrapFailure`
    // since `Failure` extends `Error`, and `Error` is compatible with `unknown`.
    return wrapFailure(message, originalFailure);
}


// --- Example Usage ---
console.log("\n--- Failure Helpers Examples ---");

// empty()
const emptyFail = emptyFailure();
console.log("Empty Failure:", emptyFail.isEmpty()); // true
console.log("Empty Failure toString:", emptyFail.toString()); // Failure.EMPTY

// with(message)
try {
    const specificFail = failureWithMessage("A user-defined error.");
    console.log("Specific Failure message:", specificFail.message); // A user-defined error.
    console.log("Specific Failure isPresent:", specificFail.isPresent()); // true

    // This will throw an IllegalArgument
    // failureWithMessage("");
} catch (e) {
    if (e instanceof IllegalArgument) {
        console.error("Caught expected error:", e.message); // Caught expected error: Failure message cannot be null...
    }
}

// wrap(message, cause)
const wrappedError = wrapFailure("Something critical failed", new Error("Internal system error."));
console.log("Wrapped Error message:", wrappedError.message); // Something critical failed
console.log("Wrapped Error cause:", wrappedError.cause); // Error: Internal system error.

const wrappedStringCause = wrapFailure(null, "Just a string error message.");
console.log("Wrapped String Cause message:", wrappedStringCause.message); // Just a string error message.

const wrappedNullCause = wrapFailure(null, null);
console.log("Wrapped Null Cause message:", wrappedNullCause.message); // An unexpected error occurred.

// wrap(message, Failure)
const originalFail = failureWithMessage("Original login failed");
const newWrappedFail = wrapExistingFailure("User authentication issue", originalFail);
console.log("New Wrapped Failure message:", newWrappedFail.message); // User authentication issue
console.log("New Wrapped Failure cause (should be original Failure):", newWrappedFail.cause === originalFail); // true
console.log("New Wrapped Failure cause message:", (newWrappedFail.cause as Failure).message); // Original login failed