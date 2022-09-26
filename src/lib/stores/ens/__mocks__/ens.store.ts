import { writable } from 'svelte/store';

const TEST_ADDRESS = '0x12345678';

export default (() => {
  const state = writable({});

  function connect() {
    return undefined;
  }

  function disconnect() {
    return undefined;
  }

  async function lookup(address: string) {
    if (address === TEST_ADDRESS) {
      const mockRecord = {
        name: 'test.eth',
        avatarUrl: 'foo.com/bar.png',
      };

      state.set({
        [TEST_ADDRESS]: mockRecord,
      });

      return mockRecord;
    }

    return undefined;
  }

  return {
    subscribe: state.subscribe,
    connect,
    disconnect,
    lookup,
  };
})();
