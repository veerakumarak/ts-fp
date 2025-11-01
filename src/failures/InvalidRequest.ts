import {Failure} from "../failure";

export class InvalidRequest extends Failure {
    private readonly _reasons?: Map<string, string[]>;

    // 3. Constructor for a single key-reason pair
    constructor(key: string, reason: string);
    // 4. Constructor for a map of reasons
    constructor(reasons: Map<string, string[]>);
    // 5. Unified implementation of the constructors
    constructor(keyOrReasons: string | Map<string, string[]>, reason?: string) {
        let message: string;
        let reasonsMap: Map<string, string[]>;

        if (typeof keyOrReasons === 'string' && reason !== undefined) {
            // Case 1: (key, reason) constructor
            const key = keyOrReasons;
            message = `Invalid request for key ${key} with reasons ${reason}`;
            reasonsMap = new Map([[key, [reason]]]); // Create a new Map with the single entry
        } else if (keyOrReasons instanceof Map) {
            // Case 2: (reasonsMap) constructor
            reasonsMap = keyOrReasons;
            // For a good message, convert the map to a readable string
            const reasonEntries = Array.from(reasonsMap.entries())
                .map(([k, v]) => `${k}: [${v.join(', ')}]`)
                .join('; ');
            message = `Invalid request with reasons {${reasonEntries}}`;
        } else {
            // Fallback or error for unexpected constructor calls
            throw new Error("Invalid arguments provided to InvalidRequest constructor.");
        }

        super(message); // Call the parent Failure's constructor with the generated message

        this._reasons = reasonsMap; // Assign the determined reasons map

        // 6. Recapture the stack trace for accurate debugging
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, InvalidRequest);
        } else {
            Object.setPrototypeOf(this, InvalidRequest.prototype);
        }
    }

}

