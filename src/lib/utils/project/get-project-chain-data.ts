// Always picks mainnet for now, once app goes multichain it'll add a `chain` param
export default function getProjectChainData<
  PCD extends { chain: string },
  PT extends { __typename: 'Project'; chainData: PCD[] },
>(project: PT): PCD | null {
  return project.chainData.find((chainData) => chainData.chain === 'MAINNET') || null;
}
