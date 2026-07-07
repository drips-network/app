import { describe, expect, it } from 'vitest';
import extractApiErrorMessage from './extract-api-error-message';

describe('extractApiErrorMessage', () => {
  it('unwraps the Wave API error body from an authenticatedCall error', () => {
    const error = new Error(
      'API call failed: 400 Bad Request - {"error":"This issue is already assigned to someone outside the Wave, please unassign them first."}',
    );

    expect(extractApiErrorMessage(error)).toBe(
      'This issue is already assigned to someone outside the Wave, please unassign them first.',
    );
  });

  it('handles a body whose message itself contains " - "', () => {
    const error = new Error(
      'API call failed: 400 Bad Request - {"error":"Used: 900/1000 - over budget"}',
    );

    expect(extractApiErrorMessage(error)).toBe('Used: 900/1000 - over budget');
  });

  it('falls back to the raw message when the body is not JSON', () => {
    const error = new Error('API call failed: 500 Internal Server Error - Something exploded');

    expect(extractApiErrorMessage(error)).toBe('Something exploded');
  });

  it('falls back to the raw message when there is no body separator', () => {
    const error = new Error('Account suspended');

    expect(extractApiErrorMessage(error)).toBe('Account suspended');
  });

  it('falls back when the JSON body has no string error field', () => {
    const error = new Error('API call failed: 400 Bad Request - {"message":"nope"}');

    expect(extractApiErrorMessage(error)).toBe('{"message":"nope"}');
  });

  it('handles non-Error values', () => {
    expect(extractApiErrorMessage('plain string')).toBe('plain string');
  });
});
