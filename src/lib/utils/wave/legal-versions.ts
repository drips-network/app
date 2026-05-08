/**
 * Versions of the legal documents the user implicitly consents to when
 * completing the Wave login flow. These are reported to the wave backend on
 * every login so the consent record can be tied to the exact document version
 * the user saw on screen.
 *
 * Bump these values whenever the Terms & Rules or Privacy Policy is materially
 * updated. The backend treats `(userId, termsVersion, privacyVersion)` as a
 * unique tuple — bumping a version produces a fresh consent row on the next
 * login while preserving the timestamp of any earlier consent.
 *
 * Date-stamp format (YYYY-MM-DD) matches the date the version went live.
 */

/** Wave Terms & Rules: https://docs.drips.network/wave/terms-and-rules */
export const WAVE_TERMS_VERSION = '2026-04-27';

/** Drips Privacy Policy: /legal/privacy */
export const PRIVACY_POLICY_VERSION = '2026-04-27';
