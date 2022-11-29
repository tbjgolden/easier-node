/* timers is split into multiple files to test in parallel */
import { createDebouncedFunction } from "./time";

test("createDebouncedFunction creates a debounced function", async () => {
  const function_ = jest.fn();
  const debouncedFunction = createDebouncedFunction(function_, 10, true);
  debouncedFunction();
  debouncedFunction();
  expect(function_.mock.calls.length).toBe(1);
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  debouncedFunction();
  expect(function_.mock.calls.length).toBe(1);
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  debouncedFunction();
  expect(function_.mock.calls.length).toBe(1);
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  expect(function_.mock.calls.length).toBe(1);
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  expect(function_.mock.calls.length).toBe(2);
});
