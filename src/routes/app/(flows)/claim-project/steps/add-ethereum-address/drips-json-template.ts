export default (address: string, network = 'ethereum') => `{
  "drips": {
    "${network}": {
      "ownedBy": "${address}"
    }
  }
}
`;
