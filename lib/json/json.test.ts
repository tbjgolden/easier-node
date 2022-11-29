import { parse, stringify, stripComments } from "./json";

test("parse", () => {
  expect(
    parse(`{
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

test("stringify", () => {
  expect(
    stringify({
      // Rainbows
      unicorn: "cake",
    })
  ).toBe('{"unicorn":"cake"}');
});

test("stripComments", () => {
  expect(
    JSON.parse(
      stripComments(`{
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
