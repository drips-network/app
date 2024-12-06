// Map(Object.entries(JSON.parse(jsonText)))

// JSON.stringify(Object.fromEntries(foo.entries()))

// Object.keys(existingJson.drips).map((key) => {
//   return `
//     "${key}"
//   `
// })

export const getChangedTemplate = (
  existingJson: object,
  address: string,
  network: string,
): [string, [number | null, number | null]] => {
  // no change, so don't highlight anything
  if (Object.keys(existingJson).length === 0) {
    return [JSON.stringify(objectTemplate(address, network), null, 2), [null, null]];
  }

  // object are now iterated in order, so when we add the new network here, it will
  // always appear last in the JSON representation.
  const existingJsonCopy = JSON.parse(JSON.stringify(existingJson));
  existingJsonCopy.drips[network] = {
    ownedBy: address,
  };

  const asJSON = JSON.stringify(existingJsonCopy, null, 2);
  const end = asJSON.lastIndexOf('}');
  // TODO: can we make this magic string based of the actual content?
  const start =
    end - '    "": {\n      "ownedBy": ""\n    }\n  }\n'.length - network.length - address.length;

  return [asJSON, [start, end]];
  // or whatever this should do
  // something like take the full config as an object
  // take the user's current configuration as an object
  // take the network we want to add
  // take the users fill configuration and add the network
  // return it as a string?
};

// the code box should also take indices, which specificy highlight position(s)

export const objectTemplate = (address: string, network = 'ethereum') => {
  return {
    drips: {
      [network]: {
        ownedBy: address,
      },
    },
  };
};

export default (address: string, network = 'ethereum') => `{
  "drips": {
    "${network}": {
      "ownedBy": "${address}"
    }
  }
}
`;
