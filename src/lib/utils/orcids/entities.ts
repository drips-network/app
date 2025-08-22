import type { OrcidApiResponse } from "./schemas";

const CLAIMING_URL_NAME = 'DRIPS_OWNERSHIP_CLAIM'

export default class Orcid {
  data: OrcidApiResponse;

  constructor(data: OrcidApiResponse) {
    this.data = data
  }

  get id(): string {
    return this.data["orcid-identifier"].path
  }

  get name(): string {
    const name = this.data.person.name
    return name['credit-name']?.value ?? ''
  }

  get bio(): string {
    const biography = this.data.person.biography
    return biography?.content ?? ''
  }

  get url(): string {
    return this.data['orcid-identifier'].uri
  }

  get claimingUrl(): string {
    const urlObj = this.data.person["researcher-urls"]?.["researcher-url"].find(ru => ru["url-name"] === CLAIMING_URL_NAME);
    return urlObj?.url?.value ?? '';
  }
}