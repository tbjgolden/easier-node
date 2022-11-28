import { runAtDate } from "./timers.helpers";

/**
 * Wait for a number of milliseconds
 */
export const delay = async (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};

/**
 * Wait until the time represented by a date
 * @param date either a date or a timestamp in milliseconds
 * @param errorIfAlreadyPast
 * true will throw an error, false will just finish, default (undefined)
 * is same as false but will console.warn
 */
export const until = async (
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

/**
 * create a wrapper function which will delay calls to a given function
 * and flatten all calls within that delay to a single call (the last one)
 *
 * commonly used in search autocomplete and other interactive + expensive operations
 *
 * @param functionToDebounce
 * @param waitMilliseconds
 * how long the delay is before it
 * @param isImmediate
 * default: false. if true, will not wait for waitMilliseconds when the last call
 * was over waitMilliseconds ago
 * @param maxWaitMilliseconds
 * if defined, this will ensure the function is called at least once every
 * maxWaitMilliseconds, as in throttle behaviour
 */
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

/**
 * create a wrapper function which will reduce the number calls to a given function
 * to a manageable amount. Unlike debounce, this will still call the function during
 * rapid bursts; sending updates after every duration of milliseconds
 *
 * commonly used when listening to events and updating something procedurally
 *
 * @param functionToDebounce
 * @param milliseconds
 * how long the delay is between calls
 * @param isImmediate
 * default: false. if true, will not wait for waitMilliseconds when the last call
 * was over waitMilliseconds ago
 */
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
