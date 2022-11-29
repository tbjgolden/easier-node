/* timers is split into multiple files to test in parallel */
import { delay } from "./time";

test("delay delays", async () => {
  const function_ = jest.fn();
  const withDelay = async (n: number) => {
    await delay(n);
    function_();
  };
  const withDelayPromise = withDelay(10);
  expect(function_).not.toBeCalled();
  await new Promise((resolve) => {
    return setTimeout(resolve, 5);
  });
  expect(function_).not.toBeCalled();
  await new Promise((resolve) => {
    return setTimeout(resolve, 10);
  });
  expect(function_).toBeCalled();
  expect(function_.mock.calls.length).toBe(1);
  await withDelayPromise;
});
