const coro = require("symcoro");

function* antCo(n) {
  const next = coro.parent;

  if (n == 0) {
    yield* coro.transfer(next, 1);
    yield* coro.transfer(next, 0); // 0 means "end of stream"
    throw new Error("not reach here ");
  }

  const prev = coro.create(antCo, `ant(${n - 1})`);
  let prevItem = yield* coro.transfer(prev, n - 1);
  let count = 1;
  while (true) {
    const item = yield* coro.transfer(prev);
    if (item === 0) {
      break;
    } else if (item === prevItem) {
      count++;
    } else {
      yield* coro.transfer(next, count);
      yield* coro.transfer(next, prevItem);
      prevItem = item;
      count = 1;
    }
  }
  yield* coro.transfer(next, count);
  yield* coro.transfer(next, prevItem);
  yield* coro.transfer(next, 0);
  throw new Error("not reach here ");
}

function ant(n, m, cb) {
  coro.run(function*() {
    const ant = coro.create(antCo);
    let item = yield* coro.transfer(ant, n);
    let i = 0;
    while (item > 0) {
      if (i++ === m) break;
      item = yield* coro.transfer(ant);
    }
    return item;
  }, cb);
}

ant(1000000, 1000000, console.log);

/**
 * exercises
 *
 * #1 `antCo()` is quite big. Extract `init()` and `process()`.
 *    - `init()` produces `[1]`.
 *    - `process(prev,next)` reads from `prev` and writes output to `next`.
 * #2 Extract `forEach(co, f)` from duplicated code for consuming output from a coroutine
 */
