import TimedPromise from "../../src/index";

it("should be timeouted with string rejection", async () => {
  const customMessage = "custom message";

  let promiseToTest = new TimedPromise((_resolve, _reject, _timeout) => {
    // do nothing
  })
    .timeout(1000, customMessage)
    .catch((e) => e);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe(customMessage);
  expect(promiseToTest.settled).toBeTruthy();
});

it("should not be catchable by parent", async () => {
  let promiseToTest = new TimedPromise((_resolve, _reject, _timeout) => {
    // do nothing
  })
    .then((v) => v)
    .catch((e) => "catched-by-parent-" + e)
    .timeout(1000, "timeout", false)
    .catch((e) => e);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("timeout");
  expect(promiseToTest.settled).toBeTruthy();
});

it("should be catchable by parent", async () => {
  let promiseToTest = new TimedPromise((_resolve, _reject, _timeout) => {
    // do nothing
  })
    .then((v) => v)
    .catch(() => "parent-timeout")
    .timeout(1000, "timeout", true)
    .catch((e) => e);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("parent-timeout");
  expect(promiseToTest.settled).toBeTruthy();
});
