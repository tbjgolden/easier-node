import { AnyARecord } from "node:dns";

import { dnsLookup, dnsResolve } from "./dns";

test("dnsLookup", async () => {
  const result = (await dnsLookup("http://localhost/")).sort(([a], [b]) => {
    return a > b ? 1 : -1;
  });

  expect(result).toEqual([
    ["IPv4", "127.0.0.1"],
    ["IPv6", "::1"],
  ]);
});

test("dnsResolve", async () => {
  const addresses = (await dnsResolve("http://localhost/"))
    .filter((record) => {
      return record.type === "A";
    })
    .map((record) => {
      return (record as AnyARecord).address;
    });
  expect(addresses).toEqual(["127.0.0.1"]);
});
