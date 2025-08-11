export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
) => {
  let timeoutId: number | undefined;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
};
