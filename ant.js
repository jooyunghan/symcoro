const coro = require("./coro");

function* ant(n, next) {
  if (n == 0) {
    yield* coro.transfer(next, 1);
    yield* coro.transfer(next, null);
    return;
  }
  const prev = coro.create(ant, n - 1, coro.current);
  let prevItem = yield* coro.transfer(prev);
  let count = 1;
  while (true) {
    const item = yield* coro.transfer(prev);
    if (item === null) {
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
  yield* coro.transfer(next, null);
}

coro.run(function*() {
  const ant10 = coro.create(ant, 10, coro.current);
  while (true) {
    const item = yield* coro.transfer(ant10);
    if (item === null) break;
    console.log(item);
  }
  yield* coro.transfer(coro.main);
});

/**
 * exercises
 *
 * #1 ant() is quite big. Extract init() and process().
 *    init() produces [1].
 *    process(prev,next) processes input from prev and produces output to next
 * #2 Extract `forEach(co, f)` from duplicated code for consuming output from a coroutine
 */
