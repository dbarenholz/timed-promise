import TimedPromise from "../../src/index";
import { approximately, sleep } from "../test";

it("should be matching", async () => {
  const start = new Date().getTime();
  const promiseTimeoutValue: number = 1500;
  const deviation: number = 15 * 5;

  let timeouted: number | null = null;

  let promiseToTest = new TimedPromise<Boolean>((_resolve, _reject, _timeout) => {});

  expect(approximately(promiseToTest.created(), start, deviation)).toBeTruthy();
  expect(approximately(promiseToTest.elapsed(), 0, deviation)).toBeTruthy();
  expect(promiseToTest.remaining()).toBe(Infinity);

  promiseToTest = promiseToTest.timeout(promiseTimeoutValue);

  promiseToTest.catch(() => {
    timeouted = new Date().getTime();
  });

  // This block tests repeatedly while not yet timeouted
  // If tests fail: log the variables, check if deviation too low (aka your machine is slow)
  while (!timeouted) {
    await sleep(100);

    const now = new Date().getTime();
    const created = promiseToTest.created();
    const elapsed = promiseToTest.elapsed();
    const remaining = promiseToTest.remaining();

    // tests: created property
    expect(approximately(created, start, deviation)).toBeTruthy();
    // tests: elapsed property
    expect(approximately(elapsed, now - start, deviation)).toBeTruthy();
    // tests: remaining property
    expect(approximately(remaining + now - start, promiseTimeoutValue, deviation)).toBeTruthy();
  }
});
