import TimedPromise from "../../src/index";

it("should be resolved", async () => {
  let promiseToTest = new TimedPromise<String>((resolve, _reject, _timeout) => {
    resolve!("resolve");
  })
    .then((v) => `${v}-then_1`)
    .catch((e) => e)
    .catch()
    .timeout(2000)
    .then((v) => `${v}-then_2`)
    .catch((e) => e);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("resolve-then_1-then_2");
  expect(promiseToTest.settled).toBeTruthy();
});

it("should be rejected", async () => {
  let promiseToTest = new TimedPromise<String>((_resolve, reject, _timeout) => {
    reject!("reject");
  })
    // then does nothing since rejected
    .then((v) => `${v}-then_1`)
    // catch here catches the rejection
    .catch((e) => `${e}-catch_1`)
    // does not influence
    .catch()
    // sets a timeout
    .timeout(2000)
    // then gets executed since error had already been caught previously
    .then((v) => `${v}-then_2`)
    // catch does not get executed, no error here
    .catch((e) => `${e}-catch_2`);

  expect.assertions(2);
  const result = await promiseToTest;
  expect(result).toBe("reject-catch_1-then_2");
  expect(promiseToTest.settled).toBeTruthy();
});
