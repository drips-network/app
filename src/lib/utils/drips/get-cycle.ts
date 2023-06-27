import { getDripsHubClient } from '../get-drips-clients';

/**
 * Fetches the current Drips cycle from on-chain and calculates the start and end dates.
 * @returns Information about the current Drips cycle.
 */
export default async function getCycle() {
  const client = await getDripsHubClient();

  const cycleDurationMillis = (await client.cycleSecs()) * 1000;
  const currentCycleMillis = new Date().getTime() % cycleDurationMillis;
  const currentCycleStart = new Date().getTime() - currentCycleMillis;

  return {
    start: new Date(currentCycleStart),
    end: new Date(currentCycleStart + cycleDurationMillis),
    durationMillis: cycleDurationMillis,
  };
}
