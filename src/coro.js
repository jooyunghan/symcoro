// inspired by Lua `coro` library

const debug = require("debug")("symcoro");

const coro = {};

const noop = () => {};

/**
 * marker object for main coroutine
 */
coro.main = {
  ctor: "coroutine",
  name: "main",
};

/**
 * currently active coroutine
 */
coro.current = coro.main;

function resume0(val) {
  this.resume = resume1;
  this.f = this.f(val);
  // we use generator-return-value
  // by not checking 'done' field
  return this.f.next().value;
}

function resume1(val) {
  // we use generator-return-value
  // by not checking 'done' field
  return this.f.next(val).value;
}

/**
 * create a coroutine as suspended
 *
 * @param {GeneratorFunction} f
 * @param {string?} name
 * @returns Coroutine
 */
coro.create = function create(f, name = f.name) {
  debug(`[${coro.current.name}] create(${name})`);
  return {
    ctor: "coroutine",
    f,
    name,
    resume: resume0,
    parent: coro.current,
  };
};

/**
 * @private
 * transfer() uses this to pass multiple values between yield/resume
 */
const TRANSFER = {type: "transfer"};
/**
 * transfer to other coroutine `co` with value.
 *
 * @param {Coroutine} co
 * @param {*} val
 */
coro.transfer = function* transfer(co, val) {
  if (co.ctor !== "coroutine") {
    throw new TypeError(`${co} is not a coroutine.`);
  }
  debug(`[${coro.current.name}] transfer(${co.name},${val})`);

  if (coro.current !== coro.main) {
    TRANSFER.next = co;
    TRANSFER.val = val;
    return yield TRANSFER;
  }

  while (true) {
    coro.current = co;
    coro.parent = co.parent;
    if (co === coro.main) {
      // TODO adjust yield frequency
      // yield to avoid cpu-intensive loop
      // this `yield` will cause `process.nextTick` to resume
      yield;

      return val;
    }
    const value = co.resume(val);
    if (value === TRANSFER) {
      co = TRANSFER.next;
      val = TRANSFER.val;
    } else {
      val = yield value;
    }
    
  }
};

/**
 * run until main coroutine `f` finishes
 * TODO replace setImmediate to other
 *
 * @param {GeneratorFunction} f
 * @param {function} callback
 */
coro.run = function run(f, callback = noop) {
  function loop(g, callback, previousValue) {
      const { value, done } = g.next(previousValue);
      if (done) {
        setImmediate(callback, value);
      } else if (value && typeof value.then === "function") {
        value.then(v => loop(g, callback, v), e => console.log("error:", e))
      } else {
        setImmediate(loop, g, callback);
      }
  }
  loop(f(), callback);
};

module.exports = coro;
