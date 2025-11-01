# 🧩 Functional Programming Utilities for TypeScript

A lightweight functional programming toolkit inspired by **Rust**’s `Result` and **Go**’s `error` handling pattern — written entirely in **TypeScript**.

This library provides expressive types and helpers such as `Pair`, `Option`, `Result`, and `Failure` for safer, cleaner, and more declarative code.

---

## 🚀 Installation

```bash
npm install @veerakumar/fp-utils
# or
yarn add @veerakumar/fp-utils
```

---

## 🧠 Overview

| Module        | Purpose                                     | Inspired by               |
| ------------- | ------------------------------------------- | ------------------------- |
| `pair.ts`     | Represents a typed pair `(A, B)`            | Functional tuples         |
| `option.ts`   | Handles optional values via `Some` / `None` | Rust’s `Option`           |
| `result.ts`   | Encapsulates success or error outcomes      | Rust’s `Result`           |
| `failure.ts`  | Represents a single typed failure (error)   | Go’s `error`              |
| `failures.ts` | Aggregates multiple `Failure` instances     | Go’s multi-error patterns |

---

## 🧩 Example Usage

### ✅ Using `Result`

```ts
// example function
function divide(a: number, b: number): Result<number> {
    if (b === 0) {
        return failureResult(Failure.ofMessage("Division by zero is not allowed."));
    }
    return okResult(a / b);
}

// Basic Usage
const res1 = divide(10, 2);
if (res1.isOk()) {
    res1.ifOk((v) => console.log("Success:", v)); // Success: 5
} else {
    res1.ifFailure((f) => console.error("Error:", f.message));
}

const res2 = divide(10, 0);
if (res2.isFailure()) {
    res2.ifFailure((f) => console.error("Error:", f.message)); // Error: Division by zero is not allowed.
} else {
    res2.ifOk((v) => console.log("Success:", v));
}

// Expect / Get
try {
    const val1 = okResult(100).expect("Expected value");
    console.log("Expected value:", val1); // Expected value: 100
} catch (e) {
    console.error("Caught expected error:", (e as Error).message);
}

// Defaulting with map/fallback
const res3 = divide(20, 0);
const safeValue = res3.isOk() ? res3.get() : 0;
console.log("Safe value:", safeValue); // 0

// ifOk / ifFailure / inspect
okResult("data").ifOk((d) => console.log("IfOk:", d)); // IfOk: data
failureResult<string>(Failure.ofMessage("Oops")).ifFailure((f) => console.error("IfFailure:", f.message)); // IfFailure: Oops

okResult(123)
    .inspectOk((v) => console.log("InspectOk value:", v)) // InspectOk value: 123
    .map((v) => v * 2)
    .inspectOk((v) => console.log("InspectOk doubled value:", v)); // InspectOk doubled value: 246

failureResult<number>(Failure.ofMessage("Chain broken"))
    .inspectFailure((f) => console.error("InspectFailure:", f.message)) // InspectFailure: Chain broken
    .map((v) => v * 2) // skipped
    .inspectOk(() => console.log("This will not print"));

// Async Result.of
(async () => {
    const safeParse = await resultOf<number>(() => {
        const num = parseInt("42", 10);
        if (isNaN(num)) throw new Error("Not a number");
        return num;
    });

    safeParse.ifOk((n) => console.log("Safely parsed:", n)); // Safely parsed: 42

    const unsafeParse = await resultOf<number>(() => {
        throw new Error("Parsing failed intentionally");
    });

    unsafeParse.ifFailure((f) => console.error("Unsafely parsed error:", f.message)); // Unsafely parsed error: Parsing failed intentionally
})();

// Map / FlatMap
const mappedResult = divide(20, 4)
    .map((num) => num * 10)
    .map((num) => `Result is ${num}`);
mappedResult.ifOk((s) => console.log("Mapped Result:", s)); // Mapped Result: Result is 50

const flatMappedResult = divide(100, 10)
    .flatMap((num) => divide(num, 2))
    .flatMap((num) => divide(num, 0));
flatMappedResult.ifFailure((f) => console.error("FlatMapped Result Error:", f.message));

console.log("\n--- toString ---");
console.log(okResult({ id: 1, name: "Test" }).toString()); // Result.Ok({"id":1,"name":"Test"})
console.log(failureResult(Failure.ofMessage("Network error")).toString()); // Result.Failure(Failure{message='Network error'})
```

---

### 🌀 Using `Option`

```ts
import { Option } from "@veerakumar/fp-utils/option";
import { Failure } from "@veerakumar/fp-utils/failure";

// --- Example Usage ---
console.log("--- Option Examples ---");

// Creating Options
const opt1 = Option.ok("Hello World");
const opt2 = Option.orUndefinedOrNullable(42);
const opt3 = Option.orUndefinedOrNullable(null); // Becomes empty
const opt4 = Option.empty<number>(); // Explicit empty Option

console.log("opt1 isOk:", opt1.isOk());          // true
console.log("opt3 isEmpty:", opt3.isEmpty());    // true
console.log("opt1 value:", opt1.get());          // "Hello World"
console.log("opt3 with default:", opt3.getOrElse(99)); // 99

// --- Mapping values ---
const upper = opt1.map(v => v.toUpperCase());
console.log("Mapped to upper:", upper.get()); // "HELLO WORLD"

// --- Flat mapping ---
const nested = Option.ok(10)
  .flatMap(n => (n > 5 ? Option.ok("big") : Option.empty()));
console.log("FlatMap result:", nested.get()); // "big"

// --- Handling empty Options safely ---
try {
  console.log(opt3.get()); // Throws Failure: Attempted to get value from an empty Option.
} catch (e) {
  if (e instanceof Failure) {
    console.error("Caught failure:", e.message);
  }
}

// --- Using async Option.of ---
async function exampleAsync() {
  const asyncOpt1 = await Option.of(async () => {
    // Simulate async computation
    return 123;
  });

  const asyncOpt2 = await Option.of(async () => {
    throw new Error("Network failure");
  });

  console.log("asyncOpt1.isOk():", asyncOpt1.isOk());  // true
  console.log("asyncOpt2.isEmpty():", asyncOpt2.isEmpty()); // true (error caught internally)
}

exampleAsync();
```

---

This example demonstrates:
- **Creation** of Options via `ok`, `empty`, and `orUndefinedOrNullable`
- **Mapping and chaining** values safely without `null` checks
- **Error protection** with custom `Failure` exceptions
- **Asynchronous Option.of()** usage for safe async handling

---

### ⚙️ Using `Failure`

```ts
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
```

---

### 🔗 Using `Failures`

```ts
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
```

---

### 🧮 Using `Pair`

```ts
import { Pair } from "@veerakumar/fp-utils/pair";

// --- Example Usage ---
console.log("--- Pair Examples ---");

// Creating Pairs
const pair1 = Pair.of("hello", 123);
const pair2 = Pair.of(true, { id: 1, name: "Item" });
const pair3 = Pair.of("hello", 123); // Same content as pair1
const pair4 = Pair.of(null, undefined); // Handles null/undefined

console.log("pair1:", pair1.toString()); // Pair(hello, 123)
console.log("pair2:", pair2.toString()); // Pair(true, [object Object])
console.log("First element of pair1:", pair1.getFirst());   // hello
console.log("Second element of pair2:", pair2.getSecond()); // { id: 1, name: "Item" }

// Equality checks
console.log("pair1 === pair3 (identity):", pair1 === pair3); // false (different instances)
console.log("pair1.equals(pair3):", pair1.equals(pair3));   // true (content is same)
console.log("pair1.equals(pair2):", pair1.equals(pair2));   // false
console.log("pair1.equals(null):", pair1.equals(null));     // false
console.log("pair1.equals('not a pair'):", pair1.equals('not a pair')); // false

// Hash codes
console.log("pair1 hashCode:", pair1.hashCode());
console.log("pair3 hashCode:", pair3.hashCode()); // Should be same as pair1's hashCode if content is same

// Using Pair in a Map (with custom equals/hashCode if needed)
// Note: JavaScript's `Map` uses strict equality (`===`) for object keys by default.
// If you want to use `Pair` objects as keys based on their value equality,
// you'd typically convert them to a string/JSON, or use a custom Map implementation.
const myMap = new Map<string, string>();
myMap.set(pair1.toString(), "Value for pair1");
console.log("Value from map using toString:", myMap.get(pair3.toString())); // Value for pair1
```
---

This example demonstrates:
- **Pair creation** from any two values
- **Equality** vs **identity** comparison
- **Hash code** generation
- **Practical use in a `Map`** via string conversion

---

🚨 Custom Failure Types

Each custom failure extends the base Failure class and represents a domain-specific or logical error.

File	Description
ApiFailure.ts	Indicates a failure in API communication or response format.
AuthFailure.ts	Represents authentication or authorization-related issues.
EntityAlreadyExists.ts	Raised when trying to create a record that already exists.
EntityNotFound.ts	Used when an expected entity or resource is missing.
EntityValidationFailed.ts	Signals validation errors during entity creation or update.
IllegalArgument.ts	Thrown when a method receives invalid or unexpected arguments.
IllegalState.ts	Indicates that an operation was attempted in an invalid state.
InternalFailure.ts	Represents internal logic or system-level errors.
InvalidRequest.ts	Used when an input request is malformed or incomplete.
OperationNotAllowed.ts	Raised when an operation violates business rules or permissions.

Example: Using a Custom Failure

```ts
import { EntityNotFound, IllegalArgument } from "./failures";

function findUserById(id: string) {
if (!id) throw new IllegalArgument("User ID must not be empty.");

const user = null; // simulate missing user
if (!user) throw new EntityNotFound(`User with ID '${id}' not found.`);
}

try {
    findUserById("");
} catch (err) {
    if (err instanceof IllegalArgument) {
        console.error("Validation Error:", err.message);
    } else if (err instanceof EntityNotFound) {
        console.error("Not Found:", err.message);
    }
}
```
## 🧱 Philosophy

This library aims to bring **Rust’s safety** and **Go’s simplicity** into the TypeScript world:

* No exceptions — just explicit results.
* Strongly typed functional helpers.
* Composable, testable, and expressive APIs.

---

## 🧪 TypeScript Support

Full type definitions included — no extra configuration needed.

---

## 🪪 License

MIT © 2025 [Veerakumar AK](https://github.com/veerakumar)

---

## 💬 Contributing

Contributions and suggestions are welcome!
Please open an issue or pull request on GitHub.

---
