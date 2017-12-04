const coro = require("symcoro")

function delay(ms, value) {
  return new Promise(r => setTimeout(r, ms, value));
}

coro.run(function* () {
  console.log(yield delay(100, "awaits a promise"));
  console.log(yield* coro.transfer(coro.create(function* myCoro() {
    yield* coro.transfer(coro.main, yield delay(500, 14 * (yield delay(500, 3))));
  })));
});