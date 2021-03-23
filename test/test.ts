// Jest requires CommonJS syntax
const fs = require("fs");

describe("Tests", () => {
  let files = fs.readdirSync(__dirname + "/tests");

  for (const file of files) {
    describe(file, () => {
      require(__dirname + "/tests/" + file);
    });
  }
});
