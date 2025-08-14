export declare const debounce: <T extends (...args: unknown[]) => unknown>(fn: T, delay: number) => (...args: Parameters<T>) => void;
