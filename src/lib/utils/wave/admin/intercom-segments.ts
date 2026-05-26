import { authenticatedCall } from '../call';

export async function pushWaveIntercomSegments(f = fetch, waveId: string): Promise<void> {
  await authenticatedCall(f, `/api/admin/intercom/wave-segments/${waveId}`, {
    method: 'POST',
  });
}
