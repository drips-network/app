// src/lib/reviver.ts

import Orcid from "./utils/orcids/entities";

// A map of class names to their constructors
const classMap = {
  Orcid,
  // You could add other classes here in the future
  // AnotherClass,
};

type ClassMap = typeof classMap;

/**
 * Revives plain objects back into their class instances.
 * @param key The current key in the object being processed.
 * @param value The value associated with the key.
 */
export function revive<T>(key: string, value: any): T {
  if (value && typeof value === 'object' && value.__class) {
    const ClassConstructor = classMap[value.__class as keyof ClassMap];
    if (ClassConstructor) {
      // Re-instantiate the class with its data
      return new ClassConstructor(value.data) as T;
    }
  }
  return value as T;
}

/**
 * A helper to walk through the entire data object from `load`.
 * @param data The data object from SvelteKit's `load` function.
 */
export function hydrate(data: any) {
	return JSON.parse(JSON.stringify(data), revive);
}