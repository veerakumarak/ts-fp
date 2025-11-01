/**
 * Represents an immutable pair of two elements, a first element of type A
 * and a second element of type B.
 *
 * @template A The type of the first element.
 * @template B The type of the second element.
 */
export class Pair<A, B> {
    // Using 'private readonly' ensures immutability and restricts direct access,
    // similar to 'private final' in Java.
    private readonly _first: A;
    private readonly _second: B;

    /**
     * Creates a new Pair instance.
     * @param first The first element.
     * @param second The second element.
     */
    private constructor(first: A, second: B) {
        this._first = first;
        this._second = second;
    }

    /**
     * Static factory method to create a new Pair instance.
     * This is the recommended way to construct Pair objects.
     * @param a The first element.
     * @param b The second element.
     * @returns A new Pair instance.
     */
    public static of<A, B>(a: A, b: B): Pair<A, B> {
        return new Pair(a, b);
    }

    /**
     * Gets the first element of the pair.
     * @returns The first element.
     */
    public getFirst(): A {
        return this._first;
    }

    /**
     * Gets the second element of the pair.
     * @returns The second element.
     */
    public getSecond(): B {
        return this._second;
    }

    /**
     * Compares this Pair with another object for equality.
     * Two Pairs are considered equal if both their first and second elements are equal.
     * @param other The object to compare with.
     * @returns `true` if the objects are equal, `false` otherwise.
     */
    public equals(other: unknown): boolean {
        // If it's the same instance, they are equal.
        if (this === other) {
            return true;
        }

        // If it's not an instance of Pair, or is null/undefined, they are not equal.
        if (!(other instanceof Pair)) {
            return false;
        }

        // Cast to Pair to access its properties for comparison.
        // TypeScript handles comparison for primitives, objects are compared by reference by default
        // unless their own `.equals` or deep comparison logic is needed.
        // For simple equality, direct `===` is often sufficient in JS/TS for non-object types
        // and for comparing references of objects.
        return this._first === other._first && this._second === other._second;
    }

    /**
     * Generates a hash code for the Pair.
     * Note: `hashCode` is less commonly used in TypeScript for collection indexing
     * compared to Java's `HashMap`/`HashSet`, which rely on it heavily.
     * This implementation provides a basic hash suitable for scenarios where a hash
     * is explicitly needed (e.g., custom hashing for a Map).
     * @returns A numeric hash code.
     */
    public hashCode(): number {
        // A simple way to combine hashes for two elements.
        // This is a common pattern but can lead to collisions.
        const hashA = this._first != null ? String(this._first).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) : 0;
        const hashB = this._second != null ? String(this._second).split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) : 0;
        return (hashA * 31) ^ hashB; // Combine with a prime number
    }

    /**
     * Returns a string representation of the Pair.
     * @returns A string in the format "Pair(first, second)".
     */
    public toString(): string {
        return `Pair(${this._first}, ${this._second})`;
    }
}
