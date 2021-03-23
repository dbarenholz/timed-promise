import assert from "assert";
import TimedPromise from "../../src/index";

// TODO: Fix these tests with correct typing
it("Upgraded TimedPromise should be resolved", async () => {
  let promise = new TimedPromise<String>(
    new Promise<String>((resolve, reject) => {
      resolve("Resolved");
    })
  );

  assert.strictEqual(await promise, "Resolved", "TimedPromise not Resolved");
});

it("TimedPromise should be rejected", async () => {
  try {
    let result = await new TimedPromise(
      new Promise((resolve, reject) => {
        reject("Rejected");
      })
    ).timeout(1000);
  } catch (error) {
    assert.strictEqual(error, "Rejected", "TimedPromise not rejected");
  }
});

it("Upgraded TimedPromise should be resolved without triggering timeout", async () => {
  let promise = new TimedPromise(
    new Promise((resolve, reject) => {
      resolve("Resolved");
    })
  ).timeout(1000);

  assert.strictEqual(await promise, "Resolved", "TimedPromise not Resolved");
});

it("Upgraded TimedPromise should be timeouted and throws exception", async () => {
  try {
    let result = await new TimedPromise(
      new Promise((resolve, reject) => {
        //resolve( 'Resolved' );
      })
    ).timeout(1000);
  } catch (error) {
    assert.strictEqual(error, "timeout", "TimedPromise not timeouted");
  }
});

it("Upgraded TimedPromise should be timeouted and catches exception", async () => {
  let result = await new TimedPromise(
    new Promise((resolve, reject) => {
      //resolve( 'Resolved' );
    })
  )
    .timeout(1000)
    .catch((error) => "Catched-" + error);

  assert.strictEqual(result, "Catched-timeout", "TimedPromise not catched");
});
