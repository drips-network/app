import network from '$lib/stores/wallet/network';
import { SchemaEncoder, ZERO_BYTES32 } from '@ethereum-attestation-service/eas-sdk';
import {
  Contract,
  type ContractTransaction,
  Interface,
  keccak256,
  type Signer,
  toUtf8Bytes,
  TransactionReceipt,
} from 'ethers';
import type { CreateApplicationDto, WrappedRoundPublic } from './schemas';
import mapFilterUndefined from '../map-filter-undefined';
import { pin } from '../ipfs';
import easAbi from './eas-abi';

function filterRelevantFields(
  applicationDataFields: CreateApplicationDto['fields'],
  applicationFormat: WrappedRoundPublic['round']['applicationFormat'],
) {
  return Object.fromEntries(
    mapFilterUndefined(applicationFormat, (field) => {
      if (!('slug' in field)) {
        // field doesn't have any data
        return undefined;
      }
      if (field.private) {
        // field is private, we don't want to include it in the attestation
        return undefined;
      }
      return [field.slug, applicationDataFields[field.slug]];
    }),
  );
}

export async function buildAttestApplicationTx(
  signer: Signer,
  recipientWalletAddress: string,
  applicationData: CreateApplicationDto,
  applicationFormat: WrappedRoundPublic['round']['applicationFormat'],
  roundSlug: string,
): Promise<ContractTransaction> {
  if (!network.retroFunding.enabled) {
    throw new Error('Retro Funding is not enabled on this network');
  }
  if (!network.retroFunding.attestationConfig.enabled) {
    throw new Error('Attestation is not enabled for this network');
  }

  // Publish the application's public fields on IPFS

  const dataToAttest = {
    projectName: applicationData.projectName,
    dripsAccountId: applicationData.dripsAccountId,
    fields: filterRelevantFields(applicationData.fields, applicationFormat),
  };

  const hash = await pin(dataToAttest);

  // Attest the application data on EAS

  const { easAddress, applicationAttestationSchemaUID } = network.retroFunding.attestationConfig;

  const schemaEncoder = new SchemaEncoder('string reviewDataIpfs,string roundSlug');
  const encodedData = schemaEncoder.encodeData([
    { name: 'reviewDataIpfs', value: hash, type: 'string' },
    { name: 'roundSlug', value: roundSlug, type: 'string' },
  ]);

  const eas = new Contract(easAddress, easAbi);

  const tx = await eas.attest.populateTransaction({
    schema: applicationAttestationSchemaUID,
    data: {
      recipient: recipientWalletAddress,
      expirationTime: 0n,
      revocable: false,
      refUID: ZERO_BYTES32,
      data: encodedData,
      value: 0n,
    },
  });

  return tx;
}

enum Event {
  Attested = 'Attested',
  Timestamped = 'Timestamped',
  RevokedOffchain = 'RevokedOffchain',
}

const TOPICS = {
  [Event.Attested]: keccak256(toUtf8Bytes('Attested(address,address,bytes32,bytes32)')),
  [Event.Timestamped]: keccak256(toUtf8Bytes('Timestamped(bytes32,uint64)')),
  [Event.RevokedOffchain]: keccak256(toUtf8Bytes('RevokedOffchain(address,bytes32,uint64)')),
};

const getDataFromReceipt = (
  receipt: TransactionReceipt,
  event: Event,
  attribute: string,
): string[] => {
  const eas = new Interface(easAbi);
  const logs = [];

  for (const log of receipt.logs.filter((l) => l.topics[0] === TOPICS[event]) || []) {
    logs.push({
      ...log,
      log: event,
      fragment: {
        name: event,
      },
      args: eas.decodeEventLog(event, log.data, log.topics),
    });
  }

  if (!logs) {
    return [];
  }

  const filteredLogs = logs.filter((l) => l.fragment?.name === event);
  if (filteredLogs.length === 0) {
    throw new Error(`Unable to process ${event} events`);
  }

  return filteredLogs.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (log: any) => eas.decodeEventLog(event, log.data, log.topics)[attribute],
  );
};

export const getUIDsFromAttestReceipt = (receipt: TransactionReceipt): string[] =>
  getDataFromReceipt(receipt, Event.Attested, 'uid');
