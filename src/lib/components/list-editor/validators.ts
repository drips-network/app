import { isAddress } from 'ethers';
import ensStore from '../../stores/ens/ens.store';
import network from '$lib/stores/wallet/network';

export const reformatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
};

export const validateProject = async (url: string): Promise<string | null> => {
  const formattedUrl = reformatUrl(url);

  const repoInfoRes = await fetch(`/api/github/${encodeURIComponent(formattedUrl)}`);
  const repoInfo = await repoInfoRes.json();
  const normalizedUrl = repoInfo.url;

  return normalizedUrl;
};

export const getDripListId = (url: string): string => {
  return url.substring(url.lastIndexOf('/') + 1);
};

export const validateDripList = async (url: string): Promise<boolean> => {
  const dripListId = getDripListId(url);
  return !!dripListId;
};

export const validateAddress = async (
  addressValue: string,
): Promise<boolean | string | undefined> => {
  if (isAddress(addressValue)) {
    return true;
  }

  if (!network.ensSupported) {
    return false;
  }

  try {
    const resolved = await ensStore.reverseLookup(addressValue);
    return resolved;
  } catch (error) {
    if ((error as Error).message.includes('invalid ENS name')) {
      return false;
    }

    throw error;
  }
};

export const createInvalidMessage = (type: string): string => {
  switch (type) {
    case 'address':
      return "This isn't a valid wallet address";
    case 'project':
      return "This isn't a GitHub repo or isn't public";
    case 'drip-list':
      return "This isn't a recognized Drip List";
    default:
      return "This isn't valid";
  }
};
