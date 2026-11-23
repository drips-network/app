import { error as httpError } from '@sveltejs/kit';
import { AccountRestrictedError } from '$lib/utils/wave/call';
import { describeDecisionError } from './describe-decision-error';

function thrown(fn: () => never): unknown {
  try {
    fn();
  } catch (e) {
    return e;
  }
}

describe('describeDecisionError', () => {
  it('unwraps the API error message from authenticatedCall errors', () => {
    const e = new Error('API call failed: 400 Bad Request - {"error":"Repo is already approved"}');
    expect(describeDecisionError(e, 'approve')).toBe('Repo is already approved');
  });

  it('explains a restricted applicant on approve instead of blaming the admin', () => {
    expect(describeDecisionError(new AccountRestrictedError(), 'approve')).toBe(
      "The person who applied for this repo is banned or restricted, so it can't be approved.",
    );
  });

  it('keeps the restricted message on reject', () => {
    expect(describeDecisionError(new AccountRestrictedError(), 'reject')).toBe(
      'Your account is currently restricted from this action.',
    );
  });

  it('describes a bare 403 as missing program-admin rights', () => {
    const e = thrown(() => httpError(403, 'Forbidden'));
    expect(describeDecisionError(e, 'reject')).toBe(
      "Not allowed: you're not an admin of this program.",
    );
  });

  it('falls back to the plain message for other errors', () => {
    expect(describeDecisionError(new Error('Network down'), 'approve')).toBe('Network down');
  });
});
