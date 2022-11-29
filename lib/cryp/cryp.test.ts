import fs from "node:fs";

import { toHashHexFast, toHashHexSecure } from "./cryp";

test(`toHashHexFast`, async () => {
  expect(await toHashHexFast(fs.readFileSync(`lib/__internal__/macos-trash`))).toBe(
    `a163fb41d4b06f43beb10c8f98ea7b50f974f876`
  );
});

test(`toHashHexSecure`, async () => {
  expect(await toHashHexSecure(fs.readFileSync(`lib/__internal__/macos-trash`))).toBe(
    `2bbf920981a95e662d6ef17849b313a7f166cc6452042cd6ea818ff3bee9949c`
  );
});
