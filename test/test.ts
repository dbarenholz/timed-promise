import { Greeter } from "../src/index";

test("My Greeter", () => {
  expect(Greeter("Daniel")).toBe("Hello Daniel");
});
