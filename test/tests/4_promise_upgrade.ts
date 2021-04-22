import TimedPromise from "../../src/index";

it("should be resolved", async () => {
  let normalPromise = new Promise((resolve, _reject) => {
    resolve(true);
  });

  let promiseToTest = new TimedPromise(normalPromise);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBeTruthy();
  expect(promiseToTest.settled).toBeTruthy();
});

it("should be rejected", async () => {
  const timeout = 1000;

  let normalPromise = new Promise((_resolve, reject) => {
    reject(true);
  });

  let promiseToTest = new TimedPromise(normalPromise).timeout(timeout);

  try {
    await promiseToTest;
  } catch (result) {
    expect(result).toBeTruthy();
  }
});

it("should be resolved without triggering timeout", async () => {
  const timeout = 1000;

  let normalPromise = new Promise((resolve, _reject) => {
    resolve(true);
  });

  let promiseToTest = new TimedPromise(normalPromise).timeout(timeout);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBeTruthy();
  expect(promiseToTest.settled).toBeTruthy();
});

it("should be timeouted and throws exception", async () => {
  const timeout = 1000;

  let normalPromise = new Promise((_resolve, _reject) => {
    // do nothing
  });

  let promiseToTest = new TimedPromise(normalPromise).timeout(timeout);

  expect.assertions(2);

  try {
    await promiseToTest;
  } catch (error) {
    expect(error).toBe("promise timeout");
  }

  expect(promiseToTest.settled).toBeTruthy();
});

it("should be timeouted and catches exception", async () => {
  const timeout = 1000;

  let normalPromise = new Promise((_resolve, _reject) => {
    // do nothing
  });

  let promiseToTest = new TimedPromise(normalPromise).timeout(timeout).catch(() => "caught");

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("caught");
  expect(promiseToTest.settled).toBeTruthy();
});
