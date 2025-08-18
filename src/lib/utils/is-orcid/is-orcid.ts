/**
 * Validates an ORCID iD.
 *
 * An ORCID iD is a 16-character string that follows a specific structure:
 * - It consists of 15 digits followed by a check digit (0-9 or 'X').
 * - It is often formatted with hyphens, e.g., "0000-0002-1825-0097".
 * - The validation uses the ISO 7064 11,2 checksum algorithm.
 *
 * @param {string} orcid The ORCID iD string to validate.
 * @returns {boolean} True if the ORCID iD is valid, false otherwise.
 */
export default function isValidOrcid(orcid: string): boolean {
  if (typeof orcid !== 'string') {
    return false;
  }

  // Remove hyphens and whitespace to get the base 16 characters.
  const baseStr: string = orcid.replace(/[-\s]/g, '');

  // An ORCID must be 16 characters long and match the pattern:
  // 15 digits followed by a final character that is a digit or 'X'.
  const orcidPattern: RegExp = /^\d{15}[\dX]$/;
  if (!orcidPattern.test(baseStr.toUpperCase())) {
    return false;
  }

  // --- Checksum Calculation (ISO 7064 11,2) ---

  let total: number = 0;
  // Iterate over the first 15 digits of the ORCID.
  for (let i = 0; i < 15; i++) {
    const digit: number = parseInt(baseStr[i], 10);
    total = (total + digit) * 2;
  }

  // Calculate the remainder when divided by 11.
  const remainder: number = total % 11;
  // Subtract the remainder from 12.
  const result: number = (12 - remainder) % 11;

  // Determine the correct check digit from the result.
  // If the result is 10, the check digit is 'X'. Otherwise, it's the digit itself.
  const calculatedCheckDigit: string = result === 10 ? 'X' : String(result);

  // Get the actual check digit from the input string.
  const actualCheckDigit: string = baseStr.charAt(15).toUpperCase();

  // Compare the calculated check digit with the actual one.
  return calculatedCheckDigit === actualCheckDigit;
}
