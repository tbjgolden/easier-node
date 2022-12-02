import dns from "node:dns";

type MatchingIPs =
  | [["v4", string]]
  | [["v6", string]]
  | [["v4", string], ["v6", string]]
  | [["v6", string], ["v4", string]];

export const lookup = async (url: string): Promise<MatchingIPs> => {
  let hasFoundIPv4 = false;
  let hasFoundIPv6 = false;

  const matches: Array<["v4", string] | ["v6", string]> = [];
  for (const { address, family } of await dns.promises.lookup(new URL(url).hostname, {
    all: true,
  })) {
    if (!hasFoundIPv4 && family === 4) {
      matches.push(["v4", address]);
      hasFoundIPv4 = true;
    }
    if (!hasFoundIPv6 && family === 6) {
      matches.push(["v6", address]);
      hasFoundIPv6 = true;
    }
    if (hasFoundIPv4 && hasFoundIPv6) {
      break;
    }
  }

  return matches as MatchingIPs;
};

export const resolve = (url: string): Promise<dns.AnyRecord[]> => {
  return dns.promises.resolveAny(new URL(url).hostname);
};
