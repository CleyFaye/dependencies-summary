/* eslint-disable no-console */

/** Output to stdout */
export const print = (...args: Array<unknown>): void => console.log(...args);

/** Output to stderr */
export const error = (...args: Array<unknown>): void => console.error(...args);
