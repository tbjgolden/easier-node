export const isLinux = () => {
  return process.platform === "linux";
};
export const isMac = () => {
  return process.platform === "darwin";
};
export const isX64 = () => {
  return process.arch === "x64";
};
export const isARM64 = () => {
  return process.arch === "arm64";
};
