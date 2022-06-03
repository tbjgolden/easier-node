import { reverseSafe } from "./string.helpers";
import { REVERSE_TESTS } from "./__fixtures__/string";

for (const { description, input, expected } of REVERSE_TESTS) {
  test(`reverseSafe: ${description}`, () => {
    expect(reverseSafe(input)).toEqual(expected);
  });
}
