import assert from "assert";
import TimedPromise from "../../lib/index";

it("should be resolved without triggering timeout", async () => {
  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    resolve("Resolved");
  }).timeout(1000);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("Resolved");
  expect(promiseToTest.settled).toBeTruthy();
});

it("should be timeouted and throws exception", async () => {
  const timeAvailable = 1000;

  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    setTimeout(resolve, timeAvailable * 2);
  }).timeout(timeAvailable);

  expect.assertions(2);

  try {
    const _ = await promiseToTest;
  } catch (result) {
    expect(result).toBe("TimedPromise Timeout");
  }

  expect(promiseToTest.settled).toBeTruthy();
});

it("should be timeouted and catches exception", async () => {
  const timeAvailable = 1000;

  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    setTimeout(resolve, timeAvailable * 2);
  })
    .timeout(timeAvailable)
    .catch((reason, ms) => {
      // Typing must be 'any' due to the way 
      let tmp: any = {
        reason: reason,
        ms: ms
      };

      return tmp;
    });

  expect.assertions(2);

  try {
    const _ = await promiseToTest;
  } catch (result) {
    expect(result).toBe("TimedPromise Timeout");
  }

  expect(promiseToTest.settled).toBeTruthy();
  //////////////

  let result = await new TimedPromise((resolve, reject, timeout) => {
    //resolve( 'Resolved' );
  })
    .timeout(1000)
    .catch((error) => "Catched-" + error);

  assert.equal(result, "Catched-timeout", "TimedPromise not catched");
});

it("should be timeouted and catches exception with lowest timeout", async () => {
  let start = new Date().getTime();

  let result = await new TimedPromise((resolve, reject, timeout) => {
    //resolve( 'Resolved' );
  })
    .timeout(5000)
    .timeout(1000)
    .timeout(2000)
    .catch((error) => "Catched-" + error);

  let elapsed = new Date().getTime() - start;

  assert.ok(950 < elapsed && elapsed < 1050, "Invalid TimedPromise timeout");
  assert.equal(result, "Catched-timeout", "TimedPromise not catched");
});

it("should settle", async () => {
  let start = new Date().getTime();

  let promise = new TimedPromise((resolve, reject, timeout) => {
    setTimeout(resolve, 1000);
  })
    .timeout(5000)
    .timeout(1000)
    .timeout(2000)
    .catch((error) => "Catched-" + error);

  assert.equal(promise.settled, false, "TimedPromise settled");

  let result = await promise;
  let elapsed = new Date().getTime() - start;

  assert.ok(950 < elapsed && elapsed < 1050, "Invalid TimedPromise timeout");
  assert.equal(result, "Catched-timeout", "TimedPromise not catched");
  assert.equal(promise.settled, true, "TimedPromise not settled");
});
