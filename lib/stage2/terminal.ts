export const getTerminalWidth = (): number => {
  return process.stdout.columns;
};

export const isInteractiveTerminal = (): boolean => {
  return Boolean(
    process.stdout &&
      process.stdout.isTTY &&
      process.env.TERM !== "dumb" &&
      !("CI" in process.env)
  );
};

export const clearTerminalScreen = () => {
  // eslint-disable-next-line no-console
  console.clear();
};
