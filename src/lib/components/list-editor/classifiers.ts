import { isSupportedGitUrl } from '../../utils/is-valid-git-url';
import { BASE_URL } from '../../utils/base-url';
import {
  getDripListId,
  reformatUrl,
  validateAddress,
  validateDripList,
  validateProject,
} from './validators';
import { getAddress, getDripList, getProject, getOrcid } from './hydrators';
import { buildRepositoryURL, isDripsProjectUrl } from '../../utils/build-repo-url';
import type { RecipientClassification } from './types';
import { isAddress } from 'ethers';
import isValidOrcidId from '$lib/utils/is-orcid-id/is-orcid-id';

export const classifyRecipient = (
  input: string,
  {
    allowProjects = true,
    allowAddresses = true,
    allowDripLists = true,
    allowOrcids = true,
  }: {
    allowProjects?: boolean;
    allowAddresses?: boolean;
    allowDripLists?: boolean;
    allowOrcids?: boolean;
  } = {},
): RecipientClassification => {
  if (allowProjects && isSupportedGitUrl(input)) {
    return {
      type: 'project',
      value: reformatUrl(input),
      async validate() {
        const validationOrUrl = await validateProject(this.value);
        if (!validationOrUrl) {
          return false;
        }

        this.value = reformatUrl(validationOrUrl);
        return true;
      },
      fetch() {
        return getProject(this.value);
      },
    };
  }

  if (allowAddresses && (input.endsWith('.eth') || isAddress(input))) {
    return {
      type: 'address',
      value: input,
      resolvedAddress: undefined,
      async validate() {
        const validation = await validateAddress(this.value);
        // we've resolved a .eth address, save its resolution
        // so we can use it later when fetching. We assume that
        // validate is always called before.
        if (typeof validation === 'string' && input.endsWith('.eth')) {
          this.resolvedAddress = validation as string;
        }
        return validation;
      },
      fetch() {
        return getAddress(this.resolvedAddress || this.value);
      },
    };
  }

  if (allowDripLists && input.includes(`${BASE_URL}/app/drip-lists/`)) {
    return {
      type: 'drip-list',
      value: getDripListId(input),
      validate() {
        return validateDripList(this.value);
      },
      fetch() {
        return getDripList(this.value);
      },
    };
  }

  if (allowProjects && isDripsProjectUrl(input)) {
    return {
      type: 'project',
      value: buildRepositoryURL(input),
      async validate() {
        return !!(await validateProject(this.value));
      },
      fetch() {
        return getProject(this.value);
      },
    };
  }

  if (allowOrcids && isValidOrcidId(input)) {
    return {
      type: 'orcid',
      value: input,
      async validate() {
        // No complex validation for ORCID IDs, just check format
        // BUT we could check if the ORCID is fetchable / not private?
        return true;
      },
      fetch() {
        return getOrcid(this.value);
      },
    }
  }

  return null;
};
