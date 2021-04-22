import fs from "fs";

describe("Tests", () => {
  let files = fs.readdirSync(__dirname + "/tests");

  for (const file of files) {
    describe(file, () => {
      require(__dirname + "/tests/" + file);
    });
  }
});

/**
 * Promisified sleep method
 * @param ms number of ms to sleep
 * @returns {Promise} promise that resolves after ms
 */
function sleep(ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns true when first and second number are approximately equal
 *
 * @param {Number} first first number
 * @param {Number} second second number
 * @param {Number} deviation allowed deviation
 * @returns {Boolean} true if a and b are approximately equal
 */
function approximately(first: number, second: number, deviation: number): boolean {
  return Math.abs(first - second) < deviation;
}

export { sleep, approximately };
