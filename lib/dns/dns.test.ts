import { AnyARecord } from "node:dns";

import { lookup, resolve } from "./dns";

test("lookup", async () => {
  const result = (await lookup("http://localhost/")).sort(([a], [b]) => {
    return a > b ? 1 : -1;
  });

  expect(result).toEqual([
    ["v4", "127.0.0.1"],
    ["v6", "::1"],
  ]);
});

test("resolve", async () => {
  const addresses = (await resolve("http://localhost/"))
    .filter((record) => {
      return record.type === "A";
    })
    .map((record) => {
      return (record as AnyARecord).address;
    });
  expect(addresses).toEqual(["127.0.0.1"]);
});
