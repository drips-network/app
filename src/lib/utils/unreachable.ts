/**
 * In situations where some value must be defined unless something went seriously
 * wrong elsewhere, call this function if it's undefined. This makes typescript
 * treat the value as definitely defined, and causes an "Unreachable code" error
 * to be thrown at runtime.
 */
export default function (): never {
  throw new Error('Unreachable code');
}
