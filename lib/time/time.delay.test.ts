/* timers is split into multiple files to test in parallel */
import { wait } from "./time";

test("wait waits", async () => {
  const function_ = jest.fn();
  const withWait = async (n: number) => {
    await wait(n);
    function_();
  };
  const withWaitPromise = withWait(10);
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
  await withWaitPromise;
});
