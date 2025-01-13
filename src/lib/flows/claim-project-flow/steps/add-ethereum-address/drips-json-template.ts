import type { FundingJson } from '$lib/utils/github/GitHub';

const NUM_SPACES = 2;

export type TemplateHighlight = [number | null, number | null];

export const getChangedTemplate = (
  existingJson: object,
  address: string,
  network: string,
): [string, TemplateHighlight] => {
  // no change, so don't highlight anything
  if (Object.keys(existingJson).length === 0) {
    return [JSON.stringify(objectTemplate(address, network), null, NUM_SPACES), [null, null]];
  }

  // object string keys are iterated in insertion order, so when we add the new network here, it will
  // always appear last in the JSON representation.
  const existingJsonCopy = JSON.parse(JSON.stringify(existingJson));
  // if there's already an entry for this network, delete it
  // and replace it with the current value.
  delete existingJsonCopy.drips[network];
  existingJsonCopy.drips[network] = {
    ownedBy: address,
  };

  const asJSON = JSON.stringify(existingJsonCopy, null, NUM_SPACES);
  const end = asJSON.lastIndexOf('}');
  // highlight should start where the drips object starts a final
  // object listing.
  const start = asJSON.lastIndexOf(',\n');

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
