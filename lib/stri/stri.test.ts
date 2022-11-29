import { REVERSE_TESTS } from "../__fixtures__/string";
import {
  fromBase64String,
  fromBase64URLString,
  fromHexString,
  reverseString,
  toBase64String,
  toBase64URLString,
  toHexString,
  toPrettyString,
  toUTF8String,
} from "./stri";

for (const { description, input, expected } of REVERSE_TESTS) {
  test(`reverseString: ${description}`, () => {
    expect(reverseString(input)).toEqual(expected);
  });
}

test("toBase64String", () => {
  expect(toBase64String("this is a tést!")).toEqual("dGhpcyBpcyBhIHTDqXN0IQ==");
});
test("toBase64URLString", () => {
  expect(toBase64URLString("this is a tést!")).toEqual("dGhpcyBpcyBhIHTDqXN0IQ");
});
test("toHexString", () => {
  expect(toHexString("this is a tést!")).toEqual("7468697320697320612074c3a9737421");
});
test("toUTF8String", () => {
  expect(toUTF8String(Buffer.from("this is a tést!"))).toEqual("this is a tést!");
});

test("fromBase64String", () => {
  expect(fromBase64String("dGhpcyBpcyBhIHTDqXN0IQ==")).toEqual("this is a tést!");
});
test("fromBase64URLString", () => {
  expect(fromBase64URLString("dGhpcyBpcyBhIHTDqXN0IQ")).toEqual("this is a tést!");
});
test("fromHexString", () => {
  expect(fromHexString("7468697320697320612074c3a9737421")).toEqual("this is a tést!");
});

test("toPrettyString", () => {
  expect(
    toPrettyString({
      a: { b: { c: { d: 4 } } },
    })
  ).toEqual(`{\n  a: { b: { c: { d: 4 } } }\n}`);
});
