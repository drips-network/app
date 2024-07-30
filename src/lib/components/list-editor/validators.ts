import { isAddress } from 'ethers/lib/utils';
import ensStore from '../../stores/ens/ens.store';

export const reformatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
};

export const validateProject = async (url: string): Promise<boolean> => {
  const formattedUrl = reformatUrl(url);

  const repoInfoRes = await fetch(`/api/github/${encodeURIComponent(formattedUrl)}`);
  const repoInfo = await repoInfoRes.json();
  const normalizedUrl = repoInfo.url;

  return !!normalizedUrl;
};

export const getDripListId = (url: string): string => {
  return url.substring(url.lastIndexOf('/') + 1);
};

export const validateDripList = async (url: string): Promise<boolean> => {
  const dripListId = getDripListId(url);
  return !!dripListId;
};

export const validateAddress = async (addressValue: string): Promise<boolean> => {
  if (isAddress(addressValue)) {
    return true;
  }

  const resolved = await ensStore.reverseLookup(addressValue);
  return !!resolved;
};
