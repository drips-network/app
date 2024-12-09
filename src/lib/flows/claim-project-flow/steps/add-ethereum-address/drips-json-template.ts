import type { FundingJson } from '$lib/utils/github/GitHub';

const NUM_SPACES = 2;

export const getChangedTemplate = (
  existingJson: object,
  address: string,
  network: string,
): [string, [number | null, number | null]] => {
  // no change, so don't highlight anything
  if (Object.keys(existingJson).length === 0) {
    return [JSON.stringify(objectTemplate(address, network), null, NUM_SPACES), [null, null]];
  }

  // object are now iterated in order, so when we add the new network here, it will
  // always appear last in the JSON representation.
  const existingJsonCopy = JSON.parse(JSON.stringify(existingJson));
  existingJsonCopy.drips[network] = {
    ownedBy: address,
  };

  const asJSON = JSON.stringify(existingJsonCopy, null, NUM_SPACES);
  const end = asJSON.lastIndexOf('}');
  // highlight should start where the drips object starts a second
  // object listing...for now.
  const start = asJSON.indexOf(',\n');

  return [asJSON, [start, end]];
};

export const objectTemplate = (address: string, network = 'ethereum'): FundingJson => {
  return {
    drips: {
      [network]: {
        ownedBy: address,
      },
    },
  };
};
