import { getAddress } from 'ethers';
import { z } from 'zod';

export const getCmcPrices = async (tokenAddresses: string[], fetch = window.fetch) => {
  if (!tokenAddresses.length) {
    return {};
  }

  try {
    // get response of known token address => token id
    const idMapRes = await (await fetch('/api/fiat-estimates/id-map')).json();
    // produce map of response
    const tokenAddressToId = z.record(z.string(), z.number()).parse(idMapRes);
    // create parameter for /api/fiat-estimates/price endpoint, removing unknown token ids
    const tokenIdsString = tokenAddresses
      .reduce((memo, address) => {
        const id = tokenAddressToId[address.toLowerCase()];
        if (id !== undefined) {
          memo.push(id);
        }

        return memo;
      }, [] as number[])
      .join(',');

    let tokenIdToPrice: Record<string, number> = {};
    if (tokenIdsString.length) {
      // get response of prices for token ids
      const priceRes = await fetch(`/api/fiat-estimates/price/${tokenIdsString}`);
      // get parsed map of response, token id => token fiat price
      tokenIdToPrice = z.record(z.string(), z.number()).parse(await priceRes.json());
    }

    // return token address => token fiat price
    return tokenAddresses.reduce<Record<string, number>>((acc, address) => {
      acc[getAddress(address)] = tokenIdToPrice[tokenAddressToId[address]];
      return acc;
    }, {});
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return {};
  }
};
