const coro = require("coro");

const produce = coro.create(function* produce() {
  for (let i = 0; i < 100; i++) {
    yield* coro.transfer(consume, i);
  }
  yield* coro.transfer(consume, null);
});

const consume = coro.create(function* consume() {
  let sum = 0;
  while (true) {
    const i = yield* coro.transfer(produce);
    if (i === null) break;
    sum += i;
  }
  yield* coro.transfer(coro.main, sum);
});

coro.run(function*() {
  console.log(yield* coro.transfer(produce));
});
