import getOrcidDisplayName from './display-name';
import type { OrcidApiResponse } from './schemas';

export const CLAIMING_URL_NAME = 'DRIPS_OWNERSHIP_CLAIM';

/**
 * A convenience class for working with crazily nested
 * ORCID API data.
 */
export default class Orcid {
  data: OrcidApiResponse;

  constructor(data: OrcidApiResponse) {
    this.data = data;
  }

  get id(): string {
    return this.data['orcid-identifier'].path;
  }

  get name(): string {
    const name = this.data.person.name;
    return getOrcidDisplayName({
      orcid: this.id,
      orcidMetadata: {
        givenName: name['given-names']?.value,
        familyName: name['family-name']?.value,
      },
    });
  }

  get bio(): string {
    const biography = this.data.person.biography;
    return biography?.content ?? '';
  }

  get url(): string {
    return this.data['orcid-identifier'].uri;
  }

  get claimingUrl(): string {
    const urlObj = this.data.person['researcher-urls']?.['researcher-url'].find(
      (ru) => ru['url-name'] === CLAIMING_URL_NAME,
    );
    return urlObj?.url?.value ?? '';
  }

  toJSON() {
    return {
      __class: 'Orcid', // A unique identifier for the reviver
      data: this.data, // The raw data needed for the constructor
    };
  }
}
