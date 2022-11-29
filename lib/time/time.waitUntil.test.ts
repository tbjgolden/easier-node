/* timers is split into multiple files to test in parallel */
import { waitUntil } from "./time";

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
