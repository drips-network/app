/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises as fs } from 'fs';
import path from 'path';
import { lock } from 'proper-lockfile';
import { TEST_ADDRESSES } from './ConnectedSession';
import { gqlClient } from './gqlClient';

export const ADDRESS_TO_ORCID_MAP: Record<string, string> = {
  [TEST_ADDRESSES[0]]: '0009-0007-1106-8413', // Shawna Test Sadler Test
  [TEST_ADDRESSES[1]]: '0009-0007-1106-8414', // Test ORCID 2
  [TEST_ADDRESSES[2]]: '0009-0007-1106-8415', // Test ORCID 3
  [TEST_ADDRESSES[3]]: '0009-0007-1106-8416', // Test ORCID 4
  [TEST_ADDRESSES[4]]: '0009-0007-1106-8417', // Test ORCID 5
  [TEST_ADDRESSES[5]]: '0009-0007-1106-8418', // Test ORCID 6
};

const lockOptions = {
  retries: 20,
  retryWait: 1000,
  realpath: false,
};

type ClaimState = 'unclaimed' | 'claiming' | 'claimed';
type OrcidStates = Record<string, ClaimState>;

const STATE_FILE_PATH = path.join(process.cwd(), 'test-data', 'orcid-states.json');

class OrcidClaimManager {
  private static instance: OrcidClaimManager;

  private constructor() {
    // The constructor is now simpler. State is managed in the file.
  }

  public static getInstance(): OrcidClaimManager {
    if (!OrcidClaimManager.instance) {
      OrcidClaimManager.instance = new OrcidClaimManager();
    }
    return OrcidClaimManager.instance;
  }

  /**
   * Reads the state from the JSON file.
   * Initializes the file if it doesn't exist.
   */
  private async _readState(): Promise<OrcidStates> {
    try {
      await fs.mkdir(path.dirname(STATE_FILE_PATH), { recursive: true });
      const fileContent = await fs.readFile(STATE_FILE_PATH, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist
        const initialState: OrcidStates = {};
        Object.values(ADDRESS_TO_ORCID_MAP).forEach((orcidId) => {
          initialState[orcidId] = 'unclaimed';
        });
        await fs.writeFile(STATE_FILE_PATH, JSON.stringify(initialState, null, 2));
        return initialState;
      }
      throw error;
    }
  }

  /**
   * Writes the given state to the JSON file.
   */
  private async _writeState(state: OrcidStates): Promise<void> {
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2));
  }

  /**
   * Helper function to delay execution.
   */
  private _delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Your GraphQL check function.
  private async _checkIfClaimed(orcidId: string) {
    const isClaimedQueryResult = await gqlClient.request(
      `query isOrcidClaimed {
        orcidLinkedIdentityByOrcid(orcid: "${orcidId}", chain: LOCALTESTNET) {
          isClaimed
          areSplitsValid
        }
      }`,
    );

    const orcidData = (isClaimedQueryResult as any).orcidLinkedIdentityByOrcid;
    return orcidData?.isClaimed === true && orcidData?.areSplitsValid === true;
  }

  public async getClaimedOrcid(
    ownerAddress: string,
    claimFunction: (orcidId: string) => Promise<void>,
  ): Promise<string> {
    const orcidId = ADDRESS_TO_ORCID_MAP[ownerAddress];
    if (!orcidId) {
      throw new Error(`No test ORCID is associated with address: ${ownerAddress}`);
    }

    // First, check the actual backend state. This can help synchronize the state file.
    const isAlreadyClaimedOnChain = await this._checkIfClaimed(orcidId);
    if (isAlreadyClaimedOnChain) {
      const release = await lock(STATE_FILE_PATH, lockOptions);
      const state = await this._readState();
      if (state[orcidId] !== 'claimed') {
        console.log(`[Manager] Syncing state for ${orcidId} to 'claimed' based on backend data.`);
        state[orcidId] = 'claimed';
        await this._writeState(state);
      }
      await release();
      return orcidId;
    }

    // Acquire a lock on the state file to coordinate workers.
    const release = await lock(STATE_FILE_PATH, lockOptions);
    const state = await this._readState();
    const currentState = state[orcidId];

    switch (currentState) {
      case 'claimed':
        await release();
        console.log(`[Manager] ORCID ${orcidId} is claimed (state file). Reusing.`);
        return orcidId;

      case 'claiming':
        await release();
        console.log(`[Manager] ORCID ${orcidId} is being claimed. Waiting...`);
        await this._delay(2000); // Wait for 2 seconds before retrying.
        return this.getClaimedOrcid(ownerAddress, claimFunction); // Retry.

      case 'unclaimed':
        console.log(`[Manager] ORCID ${orcidId} is unclaimed. Starting claim process.`);
        state[orcidId] = 'claiming';
        await this._writeState(state);
        // Release the lock so other workers can check the 'claiming' state.
        await release();

        try {
          // Perform the actual claim operation.
          await claimFunction(orcidId);

          // Re-acquire lock to update state to 'claimed'.
          const finalRelease = await lock(STATE_FILE_PATH, lockOptions);
          const finalState = await this._readState();
          finalState[orcidId] = 'claimed';
          await this._writeState(finalState);
          await finalRelease();

          console.log(`[Manager] Successfully claimed ${orcidId}.`);
          return orcidId;
        } catch (error) {
          console.error(`[Manager] Failed to claim ${orcidId}. Resetting state.`, error);
          // Re-acquire lock to reset state to 'unclaimed'.
          const errorRelease = await lock(STATE_FILE_PATH, lockOptions);
          const errorState = await this._readState();
          errorState[orcidId] = 'unclaimed';
          await this._writeState(errorState);
          await errorRelease();

          throw error; // Rethrow to fail the test.
        }

      default:
        await release();
        throw new Error(`Unknown claim state for ORCID: ${orcidId}`);
    }
  }
}

export { OrcidClaimManager };
export const orcidClaimManager = OrcidClaimManager.getInstance();
