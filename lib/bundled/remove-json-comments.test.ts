import { removeJSONComments } from "./remove-json-comments";

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
