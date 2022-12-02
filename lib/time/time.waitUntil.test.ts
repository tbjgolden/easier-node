/* timers is split into multiple files to test in parallel */
import { wait, waitUntil } from "./time";

test("until continues at a date", async () => {
  const function_ = jest.fn();
  const withDelay = async (n: number) => {
    await waitUntil(new Date(Date.now() + n));
    function_();
  };
  const withDelayPromise = withDelay(15);
  expect(function_).not.toBeCalled();
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  expect(function_).not.toBeCalled();
  await new Promise((resolve) => {
    return setTimeout(resolve, 15);
  });
  expect(function_).toBeCalled();
  expect(function_.mock.calls.length).toBe(1);
  await withDelayPromise;
});

test("until when date is in the past", async () => {
  const function_ = jest.fn();
  const withDelay = async () => {
    await waitUntil(new Date(Date.now() - 10));
    function_();
  };
  const withDelayPromise = withDelay();
  await wait(10);
  expect(function_).toBeCalled();
  await withDelayPromise;
  await expect(() => waitUntil(new Date(Date.now() - 10), true)).rejects.toThrow();
  await waitUntil(new Date(Date.now() - 10), false);
});
