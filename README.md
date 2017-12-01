# A library for symmetric coroutines

This is a JS-port of 'coro' library from *"Revisiting Coroutines"* (Ana Lúcia de Moura and Roberto Ierusalimschy, 2004)

## Example

Simple example for Producer/Consumer

```javascript
const coro = require("coro-js");

const produce = coro.create(function* produce(n) {
  yield* coro.transfer(consume, n * 3);
});

const consume = coro.create(function* consume(v) {
  yield* coro.transfer(coro.main, v * 2)
});

coro.run(function* () {
  console.log(yield* coro.transfer(p, 7)); // 42
});
```

Notice that `main` coroutine transfers control to the `produce` coroutine but gains it back from `consume` coroutine.

## API

`coro.create(f, name?)` creates a coroutine with a given generator function.

* `f`: A generator function
* `name`: Optional. Useful for debug output
* Returns a coroutine

`coro.transfer(co, val)` transfers control to another coroutine. The coroutine will be
resumed with the passed `val`. The current coroutine will be suspended.

* `co`: A coroutine which will be resumed
* `val`: Optional
* Returns when this coroutine is resumed

`coro.run(f, callback)`  runs a generator function as a `main` coroutine. When `f` returns a value, `callback` will be called with it.

* `f`: A generator function
* `callback`: Optional

## Coroutines

There are some coroutines you can pass control back and forth.

* `coro.main`: You can transfer control to the main coroutine which is a generator function passed to `coro.run(f)`.
* `coro.current`: You can pass the current coroutine as an argument when transfering control to another coroutine.
* `coro.parent`: This coroutine refers the coroutine which created the current coroutine.