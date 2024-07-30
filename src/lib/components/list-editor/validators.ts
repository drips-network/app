import { isAddress } from 'ethers/lib/utils';
import ensStore from '../../stores/ens/ens.store';

export const reformatUrl = (url: string) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
};

export const validateProject = async (url: string) => {
  const formattedUrl = reformatUrl(url);

  const repoInfoRes = await fetch(`/api/github/${encodeURIComponent(formattedUrl)}`);
  const repoInfo = await repoInfoRes.json();
  const normalizedUrl = repoInfo.url;

  return !!normalizedUrl;
};

export const getDripListId = (url: string) => {
  return url.substring(url.lastIndexOf('/') + 1);
};

export const validateDripList = async (url: string) => {
  const dripListId = getDripListId(url);
  return !!dripListId;
};

export const validateAddress = async (addressValue: string) => {
  // let address: string;

  if (isAddress(addressValue)) {
    return true;
    // address = addressValue;
  }

  // else {
  //   const resolved = await ensStore.reverseLookup(addressValue);
  //   if (!resolved) throw new AddItemError('Invalid ENS name', 'error');

  //   address = resolved;
  // }

  const resolved = await ensStore.reverseLookup(addressValue);
  return !!resolved;

  // const addressDriverClient = await getAddressDriverClient();
  // const accountId = await addressDriverClient.getAccountIdByAddress(address);

  // checkCanAdd(accountId);

  // dispatch('addAddress', {
  //   accountId,
  //   address,
  // });
};
