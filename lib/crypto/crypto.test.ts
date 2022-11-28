import fs from "node:fs";

import { hashFastHex, hashSecureHex } from "./crypto";

test(`hashFastHex`, async () => {
  expect(await hashFastHex(fs.readFileSync(`lib/assets/macos-trash`))).toBe(
    `29589172435e4672`
  );
});

test(`hashSecureHex`, async () => {
  expect(await hashSecureHex(fs.readFileSync(`lib/assets/macos-trash`))).toBe(
    `2bbf920981a95e662d6ef17849b313a7f166cc6452042cd6ea818ff3bee9949c`
  );
});
