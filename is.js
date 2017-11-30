function* generator() {}

const GeneratorFunction = Object.getPrototypeOf(generator).constructor;

module.exports = {
  generatorFunction(x) {
    return x instanceof GeneratorFunction;
  },
  generator(x) {
    return typeof x.next === 'function' && typeof x.throw === 'function';
  }
};
