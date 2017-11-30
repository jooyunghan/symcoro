const coro = {};

coro.main = (function* main() {})();

coro.current = coro.main;

coro.run = function run(co) {
  for (const s of co());
};

coro.create = function create(co, ...args) {
  return co(...args);
};

coro.transfer = function* transfer(co, val) {
  if (coro.current !== coro.main) return yield [co, val];

  while (true) {
    coro.current = co;
    if (co === coro.main) return val;
    [co, val] = co.next(val).value;
  }
};

module.exports = coro;
