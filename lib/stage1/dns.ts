import dns from "node:dns";
import { parseURL } from "./url";

type MatchingIPs =
  | [["IPv4", string]]
  | [["IPv6", string]]
  | [["IPv4", string], ["IPv6", string]]
  | [["IPv6", string], ["IPv4", string]];

export const dnsLookup = async (url: string): Promise<MatchingIPs> => {
  const { hostname } = parseURL(url);

  let hasFoundIPv4 = false;
  let hasFoundIPv6 = false;

  const matches: Array<["IPv4", string] | ["IPv6", string]> = [];
  for (const { address, family } of await dns.promises.lookup(hostname, { all: true })) {
    if (!hasFoundIPv4 && family === 4) {
      matches.push(["IPv4", address]);
      hasFoundIPv4 = true;
    }
    if (!hasFoundIPv6 && family === 6) {
      matches.push(["IPv6", address]);
      hasFoundIPv6 = true;
    }
    if (hasFoundIPv4 && hasFoundIPv6) break;
  }

  return matches as MatchingIPs;
};

export const dnsResolve = (url: string): Promise<dns.AnyRecord[]> => {
  const { hostname } = parseURL(url);
  return dns.promises.resolveAny(hostname);
};
