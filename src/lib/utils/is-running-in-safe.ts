/**
 * Naïve way of checking whether we're currently running as a safe app.
 * If we're running in an iFrame, we can assume we're in a safe app.
 */
export default () => {
  return window.parent !== window;
};
