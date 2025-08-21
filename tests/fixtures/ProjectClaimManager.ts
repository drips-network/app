/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { promises as fs } from 'fs';
import path from 'path';
import { lock } from 'proper-lockfile';
import { TEST_ADDRESSES } from './ConnectedSession';
import { gqlClient } from './gqlClient';

export const ADDRESS_TO_REPO_MAP: Record<string, string> = {
  [TEST_ADDRESSES[0]]: 'https://github.com/efstajas/drips-test-repo-1',
  [TEST_ADDRESSES[1]]: 'https://github.com/efstajas/drips-test-repo-2',
  [TEST_ADDRESSES[2]]: 'https://github.com/efstajas/drips-test-repo-3',
  [TEST_ADDRESSES[3]]: 'https://github.com/efstajas/drips-test-repo-4',
  [TEST_ADDRESSES[4]]: 'https://github.com/efstajas/drips-test-repo-5',
  [TEST_ADDRESSES[5]]: 'https://github.com/efstajas/drips-test-repo-6',
};

const lockOptions = {
  retries: 20,
  retryWait: 1000,
  realpath: false,
};

type ClaimState = 'unclaimed' | 'claiming' | 'claimed';
type RepoStates = Record<string, ClaimState>;

const STATE_FILE_PATH = path.join(process.cwd(), 'test-data', 'project-states.json');

class ProjectClaimManager {
  private static instance: ProjectClaimManager;

  private constructor() {
    // The constructor is now simpler. State is managed in the file.
  }

  public static getInstance(): ProjectClaimManager {
    if (!ProjectClaimManager.instance) {
      ProjectClaimManager.instance = new ProjectClaimManager();
    }
    return ProjectClaimManager.instance;
  }

  /**
   * Reads the state from the JSON file.
   * Initializes the file if it doesn't exist.
   */
  private async _readState(): Promise<RepoStates> {
    try {
      await fs.mkdir(path.dirname(STATE_FILE_PATH), { recursive: true });
      const fileContent = await fs.readFile(STATE_FILE_PATH, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist
        const initialState: RepoStates = {};
        Object.values(ADDRESS_TO_REPO_MAP).forEach((repoUrl) => {
          initialState[repoUrl] = 'unclaimed';
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
  private async _writeState(state: RepoStates): Promise<void> {
    await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2));
  }

  /**
   * Helper function to delay execution.
   */
  private _delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Your GraphQL check function.
  private async _checkIfClaimed(repoUrl: string) {
    const isClaimedQueryResult = await gqlClient.request(
      `query isClaimed {
        projectByUrl(url: "${repoUrl}", chains: [LOCALTESTNET]) {
          chainData {
            ...on ClaimedProjectData {
              verificationStatus
            }
            ...on UnClaimedProjectData {
              verificationStatus
            }
          }
        }
      }`,
    );

    return (isClaimedQueryResult as any).projectByUrl.chainData[0].verificationStatus === 'Claimed';
  }

  public async getClaimedProject(
    ownerAddress: string,
    claimFunction: (repoUrl: string) => Promise<void>,
  ): Promise<string> {
    const repoUrl = ADDRESS_TO_REPO_MAP[ownerAddress];
    if (!repoUrl) {
      throw new Error(`No test repository is associated with address: ${ownerAddress}`);
    }

    // First, check the actual backend state. This can help synchronize the state file.
    const isAlreadyClaimedOnChain = await this._checkIfClaimed(repoUrl);
    if (isAlreadyClaimedOnChain) {
      const release = await lock(STATE_FILE_PATH, lockOptions);
      const state = await this._readState();
      if (state[repoUrl] !== 'claimed') {
        console.log(`[Manager] Syncing state for ${repoUrl} to 'claimed' based on backend data.`);
        state[repoUrl] = 'claimed';
        await this._writeState(state);
      }
      await release();
      return repoUrl;
    }

    // Acquire a lock on the state file to coordinate workers.
    const release = await lock(STATE_FILE_PATH, lockOptions);
    const state = await this._readState();
    const currentState = state[repoUrl];

    switch (currentState) {
      case 'claimed':
        await release();
        console.log(`[Manager] Project ${repoUrl} is claimed (state file). Reusing.`);
        return repoUrl;

      case 'claiming':
        await release();
        console.log(`[Manager] Project ${repoUrl} is being claimed. Waiting...`);
        await this._delay(2000); // Wait for 2 seconds before retrying.
        return this.getClaimedProject(ownerAddress, claimFunction); // Retry.

      case 'unclaimed':
        console.log(`[Manager] Project ${repoUrl} is unclaimed. Starting claim process.`);
        state[repoUrl] = 'claiming';
        await this._writeState(state);
        // Release the lock so other workers can check the 'claiming' state.
        await release();

        try {
          // Perform the actual claim operation.
          await claimFunction(repoUrl);

          // Re-acquire lock to update state to 'claimed'.
          const finalRelease = await lock(STATE_FILE_PATH, lockOptions);
          const finalState = await this._readState();
          finalState[repoUrl] = 'claimed';
          await this._writeState(finalState);
          await finalRelease();

          console.log(`[Manager] Successfully claimed ${repoUrl}.`);
          return repoUrl;
        } catch (error) {
          console.error(`[Manager] Failed to claim ${repoUrl}. Resetting state.`, error);
          // Re-acquire lock to reset state to 'unclaimed'.
          const errorRelease = await lock(STATE_FILE_PATH, lockOptions);
          const errorState = await this._readState();
          errorState[repoUrl] = 'unclaimed';
          await this._writeState(errorState);
          await errorRelease();

          throw error; // Rethrow to fail the test.
        }

      default:
        await release();
        throw new Error(`Unknown claim state for project: ${repoUrl}`);
    }
  }
}

export type { ProjectClaimManager };
export const projectClaimManager = ProjectClaimManager.getInstance();
