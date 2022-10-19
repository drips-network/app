import { getContext, setContext } from 'svelte';

export function setService<T>(key: string | symbol, service: T): T {
  setContext(key, service);
  return service;
}

export function getService<T>(key: string | symbol): () => T {
  return () => getContext(key) as T;
}

export function defineService<T>(key: string | symbol = Symbol()): [() => T, (service: T) => T] {
  return [
    getService<T>(key),
    (service: T) => {
      setService(key, service);
      return service;
    },
  ];
}
