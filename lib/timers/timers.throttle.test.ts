/* timers is split into multiple files to test in parallel */
import { createThrottledFunction } from "./timers";

test("createThrottledFunction creates a throttled function", async () => {
  const function_ = jest.fn();
  const throttledFunction = createThrottledFunction(function_, 10, true);
  throttledFunction();
  throttledFunction();
  expect(function_.mock.calls.length).toBe(1);
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  throttledFunction();
  expect(function_.mock.calls.length).toBe(1);
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  expect(function_.mock.calls.length).toBe(2);
  throttledFunction();
  expect(function_.mock.calls.length).toBe(2);
  await new Promise((resolve) => {
    return setTimeout(resolve, 10);
  });
  expect(function_.mock.calls.length).toBe(3);
});
