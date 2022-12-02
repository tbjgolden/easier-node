import { normalize } from "./url.helpers";
export { normalize } from "./url.helpers";

export const resolve = (fromUrl: string, toUrl: string): string => {
  return normalize(new URL(toUrl, fromUrl).href);
};
