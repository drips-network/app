export default (address: string) => `{
  "drips": {
    "ethereum": {
      "ownedBy": "${address}"
    }
  }
}
`;
