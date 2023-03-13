import storedWritable from '$lib/utils/stored-writable';
import { get, writable } from 'svelte/store';
import { z } from 'zod';

const DEFAULT_TICK_INTERVAL_MS = 100;
const SLOW_MODE_TICK_INTERVAL_MS = 1000;

export default (() => {
  const slowMode = storedWritable('slow-mode', z.boolean(), false);
  const interval = writable<ReturnType<typeof setInterval> | undefined>();
  const listeners = writable<{ [registrationId: number]: () => void }>({});

  /**
   * Completely resets the store, unregisters all listeners, and
   * stops the internal interval.
   */
  function reset() {
    stop();

    interval.set(undefined);
    listeners.set({});
  }

  /**
   * Starts the internal interval, causing all registered listeners
   * to be called every 100ms.
   */
  function start() {
    if (get(interval)) throw 'Tick already running';

    interval.set(
      setInterval(_tick, get(slowMode) ? SLOW_MODE_TICK_INTERVAL_MS : DEFAULT_TICK_INTERVAL_MS),
    );

    _tick();
  }

  /** Stops the internal interval without de-registering any listeners. */
  function stop() {
    const i = get(interval);
    if (i !== undefined) {
      clearInterval(i);
    }

    interval.set(undefined);
  }

  /**
   * True if the tick is currently running and listeners are being
   * called every 100ms.
   */
  function isRunning() {
    return Boolean(get(interval));
  }

  /**
   * Register a new tick listener. Once registered, while the tick
   * is started, each listener will be called once every 100ms.
   * @param listener The listener function to call on every tick.
   * @returns The listener registration ID, which can be used to
   * subsequently de-register the listener by calling `deregister`.
   */
  function register(listener: () => void): number {
    const currListeners = Object.keys(get(listeners));

    let id = Object.keys(get(listeners)).length;

    while (currListeners[id]) id++;

    listeners.update((v) => ({ ...v, [id]: listener }));

    return id;
  }

  /**
   * De-register a previously-registered tick listener, so that it
   * no longer gets called once every 100ms.
   * @param registrationId The registration ID of the listener to
   * de-register.
   * @returns True if the registration ID was found and the listener
   * removed, false if the registration ID was unknown.
   */
  function deregister(registrationId: number): boolean {
    const currentRegistrations = get(listeners);
    if (!currentRegistrations[registrationId]) return false;

    delete currentRegistrations[registrationId];

    listeners.set(currentRegistrations);

    return true;
  }

  /**
   * Get all currently-registered listeners.
   * @returns An object of registration IDs and their listener functions.
   */
  function getListeners() {
    return get(listeners);
  }

  function setSlowMode(enabled: boolean) {
    slowMode.set(enabled);
    stop();
    start();
  }

  /** @private */
  function _tick() {
    for (const registration of Object.values(get(listeners))) {
      registration();
    }
  }

  return {
    reset,
    start,
    stop,
    isRunning,
    register,
    deregister,
    getListeners,
    slowMode: {
      subscribe: slowMode.subscribe,
    },
    setSlowMode,
  };
})();
