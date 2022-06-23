import { readJSON, removeJSONComments, writeJSON } from "./json";

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

test("removeJSONComments", () => {
  expect(
    JSON.parse(
      removeJSONComments(`{
  // Rainbows
  "unicorn": "cake"
  /*
    A multi-line comment
  */
}`)
    )
  ).toEqual({
    unicorn: "cake",
  });
});
