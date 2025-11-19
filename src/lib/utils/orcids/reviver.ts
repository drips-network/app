import Orcid from './entities';

// A map of class names to their constructors
const classMap = {
  Orcid,
};

type ClassMap = typeof classMap;

// Type guard for serialized objects
interface SerializedObject {
  __class: keyof ClassMap;
  data: unknown;
}

function isSerializedObject(value: unknown): value is SerializedObject {
  return typeof value === 'object' && value !== null && '__class' in value && 'data' in value;
}

/**
 * Revives plain objects back into their class instances.
 * @param key The current key in the object being processed.
 * @param value The value associated with the key.
 */
export function revive<T>(key: string, value: unknown): T {
  if (isSerializedObject(value)) {
    const ClassConstructor = classMap[value.__class];
    if (ClassConstructor) {
      // Re-instantiate the class with its data
      // Using 'as never' allows any constructor signature to work
      return new ClassConstructor(value.data as never) as T;
    }
  }
  return value as T;
}

/**
 * A helper to walk through the entire data object from `load`.
 * @param data The data object from SvelteKit's `load` function.
 */
export function hydrate(data: unknown) {
  return JSON.parse(JSON.stringify(data), revive);
}
