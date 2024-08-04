import { isSupportedGitUrl } from '../../utils/is-valid-git-url';
import { BASE_URL } from '../../utils/base-url';
import {
  getDripListId,
  reformatUrl,
  validateAddress,
  validateDripList,
  validateProject,
} from './validators';
import { getAddress, getDripList, getProject } from './hydrators';
import { isAddress } from 'ethers/lib/utils';
import { buildRepositoryURL, isDripsProjectUrl } from '../../utils/build-repo-url';
import type { RecipientClassification } from './types';

export const classifyRecipient = (
  input: string,
  {
    allowProjects = true,
    allowAddresses = true,
    allowDripLists = true,
  }: {
    allowProjects?: boolean;
    allowAddresses?: boolean;
    allowDripLists?: boolean;
  } = {},
): RecipientClassification => {
  if (allowProjects && isSupportedGitUrl(input)) {
    return {
      type: 'project',
      value: reformatUrl(input),
      validate() {
        return validateProject(this.value);
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
      async validate () {
        const validation = await validateAddress(this.value)
        // we've resolved a .eth address
        if (typeof validation === 'string' && input.endsWith('.eth')) {
          this.resolvedAddress = validation as string
        }
        return validation
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
      validate() {
        return validateProject(this.value);
      },
      fetch() {
        return getProject(this.value);
      },
    };
  }

  return null;
};
