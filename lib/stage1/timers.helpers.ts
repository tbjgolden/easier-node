export const runAtDate = (timestamp: number, callback: () => void) => {
  const now = Date.now();
  const diff = Math.max(timestamp - now, 0);
  if (diff > 0x7f_ff_ff_ff)
    setTimeout(function () {
      runAtDate(timestamp, callback);
    }, 0x7f_ff_ff_ff);
  else setTimeout(callback, diff);
};
