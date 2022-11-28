import { URL } from "node:url";

import { normalizeURL } from "./url.helpers";
export { normalizeURL } from "./url.helpers";

const DEFAULT_PORT_MAP = new Map<string, number>([
  ["http:", 80],
  ["https:", 443],
  ["ws:", 80],
  ["wss:", 443],
  ["ftp:", 21],
  ["ssh:", 22],
  ["sftp:", 22],
  ["mysql:", 3306],
  ["postgresql:", 5432],
  ["mongodb:", 27_017],
  ["redis:", 6379],
]);

export const getDefaultPortForProtocol = (protocol: string): number | undefined => {
  return DEFAULT_PORT_MAP.get(protocol);
};

export type ParsedURL = {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  password: string;
  pathname: string;
  protocol: string;
  search: string;
  searchParams: URLSearchParams;
  username: string;
  port: number | "";
};

export const parseURL = (inputURL: string, baseURL?: string): ParsedURL => {
  const rawURL = new URL(inputURL, baseURL);
  return {
    hash: rawURL.hash,
    host: rawURL.host,
    hostname: rawURL.hostname,
    href: rawURL.href,
    origin: rawURL.origin,
    password: rawURL.password,
    pathname: rawURL.pathname,
    protocol: rawURL.protocol,
    search: rawURL.search,
    searchParams: rawURL.searchParams,
    username: rawURL.username,
    port:
      rawURL.port === ""
        ? getDefaultPortForProtocol(rawURL.protocol) ?? ""
        : Number.parseInt(rawURL.port),
  };
};

export const resolveURLs = (urlA: string, urlB: string): string => {
  const url = parseURL(urlB, urlA);
  return normalizeURL(url.href);
};
