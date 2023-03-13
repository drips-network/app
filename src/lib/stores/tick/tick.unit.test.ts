import tick from './tick.store';

afterEach(() => {
  tick.reset();
  vi.useRealTimers();
});

describe('tick', () => {
  it('starts after being started', () => {
    tick.start();

    expect(tick.isRunning()).toBe(true);
  });

  it('stops after being reset', () => {
    expect(tick.isRunning()).toBe(false);
  });

  it('returns a listener after adding it', () => {
    const listener = vi.fn();

    const registrationId = tick.register(listener);

    expect(Object.keys(tick.getListeners()).length).toBe(1);
    expect(tick.getListeners()[registrationId]).toBe(listener);
  });

  it('no longer returns a listener after removing it', () => {
    const listener = vi.fn();

    const registrationId = tick.register(listener);
    tick.deregister(registrationId);

    expect(Object.keys(tick.getListeners()).length).toBe(0);
    expect(tick.getListeners()[registrationId]).toBe(undefined);
  });

  it('calls registered listeners every 100ms while running', async () => {
    vi.useFakeTimers();

    const listener1 = vi.fn();

    const regId1 = tick.register(listener1);
    tick.start();

    vi.advanceTimersByTime(1500);

    expect(listener1).toBeCalledTimes(16);

    const listener2 = vi.fn();
    const regId2 = tick.register(listener2);

    vi.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(26);
    expect(listener2).toBeCalledTimes(10);

    tick.stop();

    vi.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(26);
    expect(listener2).toBeCalledTimes(10);

    tick.start();

    vi.advanceTimersByTime(1500);

    expect(listener1).toBeCalledTimes(42);
    expect(listener2).toBeCalledTimes(26);

    tick.deregister(regId1);

    vi.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(42);
    expect(listener2).toBeCalledTimes(36);

    tick.deregister(regId2);

    vi.advanceTimersByTime(1000);

    expect(listener1).toBeCalledTimes(42);
    expect(listener2).toBeCalledTimes(36);
  });
});

export {};
