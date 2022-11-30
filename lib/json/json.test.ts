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

  expect(
    stripComments(`{\n// Rainbows\n"unicorn":\n"cake"\n/*\nA multi-line comment\n*/\n}`)
  ).toEqual(`{\n\n"unicorn":\n"cake"\n\n}`);

  expect(
    stripComments(
      `{\r\n// Rainbows\r\n"unicorn":\r\n"cake"\r\n/*\r\nA multi-line comment\r\n*/\r\n}`
    )
  ).toEqual(`{\r\n\r\n"unicorn":\r\n"cake"\r\n\r\n}`);

  expect(stripComments(`{"unicorn":"cake"}// A single-line comment`)).toEqual(
    `{"unicorn":"cake"}`
  );
  // weird edge case when multiline comment is unterminated
  expect(stripComments(`{"unicorn":"cake"}/* A multi-line comment`)).toEqual(
    '{"unicorn":"cake"}'
  );
});
