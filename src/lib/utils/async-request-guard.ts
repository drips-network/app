export function createAsyncRequestGuard() {
  let version = 0;

  return {
    beginRequest() {
      version += 1;
      return version;
    },
    invalidate() {
      version += 1;
    },
    isCurrent(requestVersion: number) {
      return requestVersion === version;
    },
  };
}
