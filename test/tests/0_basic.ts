import { TimedPromise } from "../../src/index";

// Rejection is with <any>, so only one possible value needs to be tested
// (there's no difference in rejecting TimedPromise<Boolean> or rejecting TimedPromise<Date> or any other type)
it("rejection should be rejected", async () => {
  let promiseToTest = new TimedPromise<Boolean>((_resolve, reject, _timeout) => {
    reject!(true);
  });

  expect.assertions(2);

  // Rejection not caught in promise, catch here.
  try {
    await promiseToTest;
  } catch (result) {
    expect(result).toBeTruthy();
  }

  expect(promiseToTest.settled).toBeTruthy();
});

// Tests for all 9 standard ECMAScript types.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
// == data types ==
it("undefined should be resolved", async () => {
  let something_undefined: undefined;

  let promiseToTest = new TimedPromise<undefined>((resolve, _reject, _timeout) => {
    resolve!(something_undefined);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBeUndefined();
  expect(promiseToTest.settled).toBeTruthy();
});

// false in stead of true, chosen at random
it("boolean should be resolved", async () => {
  let promiseToTest = new TimedPromise<Boolean>((resolve, _reject, _timeout) => {
    resolve!(false);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBeFalsy();
  expect(promiseToTest.settled).toBeTruthy();
});

it("number should be resolved", async () => {
  // number 3 chosen at random
  const someNumber = 3;

  let promiseToTest = new TimedPromise<Number>((resolve, _reject, _timeout) => {
    resolve!(someNumber);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(someNumber);
  expect(promiseToTest.settled).toBeTruthy();
});

it("string should be resolved", async () => {
  // string chosen at random
  const someString = "hi, I'm a string";

  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    resolve!(someString);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(someString);
  expect(promiseToTest.settled).toBeTruthy();
});

it("bigint should be resolved", async () => {
  // bigint chosen at random
  const someBigint = BigInt(123412341234);

  let promiseToTest = new TimedPromise<BigInt>((resolve, _reject, _timeout) => {
    resolve!(someBigint);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(someBigint);
  expect(promiseToTest.settled).toBeTruthy();
});

it("symbol should be resolved", async () => {
  // symbol chosen at random
  const someSymbol = Symbol("some_symbol");

  let promiseToTest = new TimedPromise<Symbol>((resolve, _reject, _timeout) => {
    resolve!(someSymbol);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(someSymbol);
  expect(promiseToTest.settled).toBeTruthy();
});

// == structural types ==

it("object should be resolved", async () => {
  // object chosen at random
  const someObject = {
    some_property: 3,
    other_property: [7, 2, 3],
    nested_obj: {
      with_property: "Test String",
    },
  };

  let promiseToTest = new TimedPromise<Object>((resolve, _reject, _timeout) => {
    resolve!(someObject);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(someObject);
  expect(promiseToTest.settled).toBeTruthy();
});

it("function should be resolved", async () => {
  // function chosen at random
  // note: this function cannot be called, unless you have a function named "three"
  const someFunction = Function("one", "two", "three");

  let promiseToTest = new TimedPromise<Object>((resolve, _reject, _timeout) => {
    resolve!(someFunction);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(someFunction);
  expect(promiseToTest.settled).toBeTruthy();
});

// == structural root primitive ==
it("null should be resolved", async () => {
  // function chosen at random
  const someNull = null;

  let promiseToTest = new TimedPromise<null>((resolve, _reject, _timeout) => {
    resolve!(someNull);
  });

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(someNull);
  expect(promiseToTest.settled).toBeTruthy();
});
