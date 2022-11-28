import fs from "node:fs";

import { hashFastHex, hashSecureHex } from "./crypto";

test(`hashFastHex`, async () => {
  expect(await hashFastHex(fs.readFileSync(`lib/__internal__/macos-trash`))).toBe(
    `a163fb41d4b06f43beb10c8f98ea7b50f974f876`
  );
});

test(`hashSecureHex`, async () => {
  expect(await hashSecureHex(fs.readFileSync(`lib/__internal__/macos-trash`))).toBe(
    `2bbf920981a95e662d6ef17849b313a7f166cc6452042cd6ea818ff3bee9949c`
  );
});
