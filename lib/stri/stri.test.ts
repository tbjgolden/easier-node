import { REVERSE_TESTS } from "../__fixtures__/string";
import {
  fromBase64,
  fromBase64URL,
  fromHex,
  reverse,
  toBase64,
  toBase64URL,
  toHex,
  toPretty,
  toUTF8,
} from "./stri";

for (const { description, input, expected } of REVERSE_TESTS) {
  test(`reverseString: ${description}`, () => {
    expect(reverse(input)).toEqual(expected);
  });
}

test("toBase64String", () => {
  expect(toBase64("this is a tést!")).toEqual("dGhpcyBpcyBhIHTDqXN0IQ==");
});
test("toBase64URLString", () => {
  expect(toBase64URL("this is a tést!")).toEqual("dGhpcyBpcyBhIHTDqXN0IQ");
});
test("toHexString", () => {
  expect(toHex("this is a tést!")).toEqual("7468697320697320612074c3a9737421");
  expect(toHex(Buffer.from("this is a tést!"))).toEqual(
    "7468697320697320612074c3a9737421"
  );
  // eslint-disable-next-line unicorn/prefer-code-point
  const uint8Arr = new Uint8Array([..."this is a test!"].map((c) => c.charCodeAt(0)));
  expect(toHex(uint8Arr)).toEqual("746869732069732061207465737421");
});
test("toUTF8String", () => {
  expect(toUTF8(Buffer.from("this is a tést!"))).toEqual("this is a tést!");
});

test("fromBase64String", () => {
  expect(fromBase64("dGhpcyBpcyBhIHTDqXN0IQ==")).toEqual("this is a tést!");
});
test("fromBase64URLString", () => {
  expect(fromBase64URL("dGhpcyBpcyBhIHTDqXN0IQ")).toEqual("this is a tést!");
});
test("fromHexString", () => {
  expect(fromHex("7468697320697320612074c3a9737421")).toEqual("this is a tést!");
});

test("toPrettyString", () => {
  expect(
    toPretty({
      a: { b: { c: { d: 4 } } },
    })
  ).toEqual(`{\n  a: { b: { c: { d: 4 } } }\n}`);
});
