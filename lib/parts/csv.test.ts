import { readJSON, writeJSON } from "./json";

test("readJSON", () => {
  expect(
    readJSON(`{
  // Rainbows
  "unicorn": "cake"
  /*
    A multi-line comment
  */
}`)
  ).toEqual({
    // Rainbows
    unicorn: "cake",
  });
});

test("writeJSON", () => {
  expect(
    writeJSON({
      // Rainbows
      unicorn: "cake",
    })
  ).toBe('{"unicorn":"cake"}');
});
