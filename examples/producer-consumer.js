const coro = require("coro");

const END = {};

const produce = coro.create(function* produce(n) {
  for (let i = 0; i < n; i++) {
    console.log("produce", i);
    yield* coro.transfer(consume, i);
  }
  yield* coro.transfer(consume, END);
});

const consume = coro.create(function* consume(i) {
  let sum = 0;
  while (i !== END) {
    console.log("consume", i);
    sum += i;
    i = yield* coro.transfer(produce);
  }
  yield* coro.transfer(coro.main, sum);
});

coro.run(function*() {
  return yield* coro.transfer(produce, 10);
}, console.log);
