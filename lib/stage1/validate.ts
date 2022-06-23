import * as net from "node:net";

export const isIP = (string: string): boolean => {
  return net.isIP(string) !== 0;
};

export const isIPv4 = (string: string): boolean => {
  return net.isIPv4(string);
};

export const isIPv6 = (string: string): boolean => {
  return net.isIPv6(string);
};
