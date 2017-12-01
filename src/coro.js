// inspired by Lua `coro` library

const debug = require("debug")("coro-js");

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
  this.g = this.f(val);
  delete this.f;
  // we use generator-return-value
  // by not checking 'done' field
  return this.g.next().value;
}

function resume1(val) {
  // we use generator-return-value
  // by not checking 'done' field
  return this.g.next(val).value;
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
const deaddrop = {};

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
    // for performance
    // use global deaddrop to return multiple values
    // otherwise `yield [co, val]`
    //       and `[co,val] = co.resume(val)`
    //       will be fine.
    deaddrop.next = co;
    deaddrop.val = val;
    return yield;
  }

  while (true) {
    coro.current = co;
    coro.parent = co.parent;
    if (co === coro.main) {
      // yield to avoid cpu-intensive loop
      // this `yield` will cause `process.nextTick` to resume
      yield;

      return val;
    }
    co.resume(val);
    co = deaddrop.next;
    val = deaddrop.val;
  }
};

/**
 * run until main coroutine `f` finishes
 *
 * @param {GeneratorFunction} f
 * @param {function} callback
 */
coro.run = function run(f, callback = noop) {
  function loop(g, callback) {
    while (true) {
      const { value, done } = g.next();
      if (done) {
        return setImmediate(callback, value);
      } else {
        return setImmediate(loop, g, callback);
      }
    }
  }
  loop(f(), callback);
};

module.exports = coro;
