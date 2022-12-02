export const resolve = (fromUrl: string, toUrl: string): string => {
  return new URL(toUrl, fromUrl).href;
};
