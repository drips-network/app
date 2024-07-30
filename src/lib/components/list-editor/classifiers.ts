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

export const classifyRecipient = (input: string) => {
  if (isSupportedGitUrl(input)) {
    // await addProject(value);
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

  if (input.endsWith('.eth') || isAddress(input)) {
    // await addAddress(value);
    return {
      type: 'address',
      value: input,
      validate() {
        return validateAddress(this.value);
      },
      fetch() {
        return getAddress(this.value);
      },
    };
  }

  if (input.includes(`${BASE_URL}/app/drip-lists/`)) {
    return {
      type: 'drip-list',
      value: getDripListId(input),
      validate() {
        return validateDripList(this.value);
      },
      fetch() {
        return getDripList(this.value);
        // return getDripList(this.value);
      },
    };
    // await addDripList(value);
  }

  if (isDripsProjectUrl(input)) {
    return {
      type: 'project',
      value: buildRepositoryURL(input),
      validate() {
        return validateProject(this.value);
      },
      fetch() {
        return getProject(this.value);
      },

      // await addDripsProject(value);
    };
  }

  return null;
};
