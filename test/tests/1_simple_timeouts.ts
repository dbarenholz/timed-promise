import TimedPromise from "../../src/index";
import { approximately } from "../test";

it("should be resolved without triggering timeout", async () => {
  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    resolve!("Resolved");
  }).timeout(1000);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("Resolved");
  expect(promiseToTest.settled).toBeTruthy();
});

it("should be timeouted and throws exception", async () => {
  const timeAvailable = 1000;

  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    setTimeout(resolve!, timeAvailable * 2);
  }).timeout(timeAvailable);

  expect.assertions(2);

  // We expect exception, catch it here.
  try {
    await promiseToTest;
  } catch (result) {
    expect(result).toBe("promise timeout");
  }

  expect(promiseToTest.settled).toBeTruthy();
});

it("should be timeouted and catches exception", async () => {
  const timeAvailable = 1000;

  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    setTimeout(resolve!, timeAvailable * 2);
  })
    .timeout(timeAvailable)
    .catch((reason, _ms) => {
      return reason;
    });

  // Exception caught above.
  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("promise timeout");
  expect(promiseToTest.settled).toBeTruthy();
});

it("should be timeouted and catches exception with lowest timeout", async () => {
  const baseTimeAvailable = 1000;
  const start = new Date().getTime();

  let promiseToTest = new TimedPromise((_resolve, _reject, _timeout) => {
    // do nothing
  })
    .timeout(5 * baseTimeAvailable)
    .timeout(1 * baseTimeAvailable)
    .timeout(2 * baseTimeAvailable)
    .catch((reason, _ms) => {
      return reason;
    });

  expect.assertions(3);

  const result = await promiseToTest;
  const timeElapsed = new Date().getTime() - start;
  const deviation = 50;
  expect(result).toBe("promise timeout");
  expect(approximately(timeElapsed, baseTimeAvailable, deviation)).toBeTruthy();
  expect(promiseToTest.settled).toBeTruthy();
});

it("should settle", async () => {
  const baseTimeAvailable = 1000;

  let promiseToTest = new TimedPromise((resolve, _reject, _timeout) => {
    setTimeout(() => resolve!("done"), 3 * baseTimeAvailable);
  })
    .timeout(baseTimeAvailable)
    .catch(() => "caught");

  expect.assertions(2);

  expect(promiseToTest.settled).toBeFalsy();
  await promiseToTest;
  expect(promiseToTest.settled).toBeTruthy();
});
