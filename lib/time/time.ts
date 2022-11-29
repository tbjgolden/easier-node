import { runAtDate } from "./time.helpers";

export const wait = async (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};

export const waitUntil = async (
  date: Date | number,
  errorIfAlreadyPast?: boolean | undefined
): Promise<void> => {
  const now = Date.now();
  const timestamp = date instanceof Date ? date.getTime() : date;

  if (timestamp < now) {
    if (errorIfAlreadyPast) {
      throw new Error(`Tried to wait until ${date}, but it is in the past`);
    } else if (errorIfAlreadyPast === undefined) {
      // eslint-disable-next-line no-console
      console.warn(
        `Tried to wait until ${date}, but it is in the past, finishing immediately`
      );
    }
    return;
  }

  return new Promise((resolve) => {
    runAtDate(timestamp, () => {
      resolve();
    });
  });
};

export const createDebouncedFunction = <
  FunctionType extends (...arguments_: unknown[]) => unknown
>(
  functionToDebounce: FunctionType,
  waitMilliseconds: number,
  isImmediate = false,
  maxWaitMilliseconds?: number | undefined
): ((...arguments_: Parameters<FunctionType>) => Promise<ReturnType<FunctionType>>) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastInvokeTime = Date.now();

  const nextInvokeTimeout = () => {
    if (maxWaitMilliseconds !== undefined) {
      const timeSinceLastInvocation = Date.now() - lastInvokeTime;
      if (timeSinceLastInvocation + waitMilliseconds >= maxWaitMilliseconds) {
        return maxWaitMilliseconds - timeSinceLastInvocation;
      }
    }
    return waitMilliseconds;
  };

  return (...arguments_: Parameters<FunctionType>) => {
    return new Promise<ReturnType<FunctionType>>((resolve) => {
      const invokeFunction = () => {
        lastInvokeTime = Date.now();
        resolve(functionToDebounce(...arguments_) as ReturnType<FunctionType>);
        timeoutId = setTimeout(() => {
          timeoutId = undefined;
        }, waitMilliseconds);
      };
      const shouldCallNow = isImmediate && timeoutId === undefined;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(invokeFunction, nextInvokeTimeout());
      if (shouldCallNow) {
        return resolve(functionToDebounce(...arguments_) as ReturnType<FunctionType>);
      }
    });
  };
};

export const createThrottledFunction = <
  FunctionType extends (...arguments_: unknown[]) => unknown
>(
  functionToDebounce: FunctionType,
  milliseconds: number,
  isImmediate = false
): ((...arguments_: Parameters<FunctionType>) => Promise<ReturnType<FunctionType>>) => {
  return createDebouncedFunction(
    functionToDebounce,
    milliseconds,
    isImmediate,
    milliseconds
  );
};
