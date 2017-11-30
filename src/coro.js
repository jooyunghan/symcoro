// inspired by Lua `coro` library
const debug = require("util").debuglog("coro");
const is = require("./is");

const coro = {};

/**
 * marker object for main coroutine
 */
coro.main = (function* main() {})();

/**
 * currently active coroutine
 */
coro.current = coro.main;

/**
 * run until main coroutine `co` finishes
 *
 * @param {GeneratorFunction} co
 */
coro.run = function run(co) {
  if (!is.generatorFunction(co)) {
    throw new Error("run: coroutine should be a GeneratorFunction");
  }
  for (const s of co()) {
  }
}

/**
 * create a coroutine as suspended
 *
 * @param {GeneratorFunction} co
 */
coro.create = function create(co, ...args) {
  if (!is.generatorFunction(co)) {
    throw new Error("create: coroutine should be a GeneratorFunction");
  }
  debug(`create ${co.name}`);
  const g = co(...args);
  const str = args.length > 1 ? `${args[0]},...` : args[0] || "";
  g.name = `${co.name || "(anonymous)"}(${str})`;
  return g;
};

/**
 * transfer to other coroutine `co` with value.
 *
 * @param {Generator} co
 * @param {*} val
 */
coro.transfer = function* transfer(co, val) {
  if (!is.generator(co)) {
    throw new Error("transfer: 'co' should be a coroutine.", co);
  }
  debug(`[${coro.current.name}]: transfer to ${co.name} with val=${val}`);
  if (coro.current !== coro.main) {
    return yield [co, val];
  }
  while (true) {
    coro.current = co;
    if (co === coro.main) {
      return val;
    }
    [co, val] = co.next(val).value;
  }
};

module.exports = coro;
