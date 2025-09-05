import network from '$lib/stores/wallet/network';
import { SchemaEncoder, ZERO_BYTES32 } from '@ethereum-attestation-service/eas-sdk';
import {
  Contract,
  type ContractTransaction,
  Interface,
  keccak256,
  type Provider,
  toUtf8Bytes,
  TransactionReceipt,
} from 'ethers';
import mapFilterUndefined from '../map-filter-undefined';
import { pin } from '../ipfs';
import easAbi from './eas-abi';
import type { ApplicationFormFields, CreateApplicationDto } from './types/application';

function filterRelevantFields(
  applicationDataFields: CreateApplicationDto['answers'],
  fields: ApplicationFormFields,
): CreateApplicationDto['answers'] {
  return mapFilterUndefined(fields, (field) => {
    const slug = 'slug' in field ? field.slug : null;
    const fieldId = 'id' in field ? field.id : null;

    if (!fieldId) {
      throw new Error('Field is missing id');
    }

    if (!slug) {
      // field doesn't have any data
      return undefined;
    }
    if ('private' in field && field.private) {
      // field is private, we don't want to include it in the attestation
      return undefined;
    }

    const submittedField = applicationDataFields.find((f) => f.fieldId === fieldId);

    if (!submittedField) {
      throw new Error(`Fillable field ${fieldId} is missing`);
    }

    return submittedField;
  });
}

export async function pinApplicationAttestationData(
  applicationData: CreateApplicationDto,
  formFields: ApplicationFormFields,
): Promise<string> {
  if (!network.retroFunding.enabled) {
    throw new Error('Retro Funding is not enabled on this network');
  }

  const dataToPin: CreateApplicationDto = {
    ...applicationData,
    answers: filterRelevantFields(applicationData.answers, formFields),
  };

  return pin(dataToPin);
}

export function applicationAttestationData(ipfsHash: string, roundSlug: string) {
  const schemaEncoder = new SchemaEncoder('string reviewDataIpfs,string roundSlug');

  return schemaEncoder.encodeData([
    { name: 'reviewDataIpfs', value: ipfsHash, type: 'string' },
    { name: 'roundSlug', value: roundSlug, type: 'string' },
  ]);
}

export async function buildAttestApplicationTx(
  recipientWalletAddress: string,
  encodedData: string,
): Promise<ContractTransaction> {
  if (!network.retroFunding.enabled) {
    throw new Error('Retro Funding is not enabled on this network');
  }
  if (!network.retroFunding.attestationConfig.enabled) {
    throw new Error('Attestation is not enabled for this network');
  }

  // Attest the application data on EAS

  const { easAddress, applicationAttestationSchemaUID } = network.retroFunding.attestationConfig;

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

export async function getNonce(provider: Provider, forAddress: string): Promise<number> {
  if (!network.retroFunding.enabled || !network.retroFunding.attestationConfig.enabled) {
    throw new Error('Retro Funding attestations are not enabled on this network');
  }

  const { easAddress } = network.retroFunding.attestationConfig;

  const eas = new Contract(easAddress, easAbi, provider);

  return Number(await eas.getNonce(forAddress));
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
