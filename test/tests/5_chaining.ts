import TimedPromise from "../../lib/index";

it("should be resolved", async () => {
  // Create timedPromise that resolves
  let promise = new TimedPromise<String>((resolve, _reject, _timeout) => {
    resolve("Resolved");
  });

  expect(
    promise
      .then((v) => v + "-then_1")
      .catch((e) => e)
      .catch()
      .timeout(2000)
      .then((v) => v + "-then_2")
      .catch((e) => e)
  ).toBe("Resolved-then_1-then_2");

  expect(promise.settled).toBeTruthy();
});

it("should be rejected", () => {
  let promise = new TimedPromise((resolve, reject, timeout) => {
    reject("Rejected");
  });

  expect(
    promise
      .then((v) => v + "-then_1")
      .catch((e) => e)
      .timeout(2000)
      .then((v) => v + "-then_2")
      .catch((e) => e)
  ).toBe("Rejected-then_2");

  expect(promise.settled).toBeTruthy();
});
