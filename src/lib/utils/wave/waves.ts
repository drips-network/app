import { authenticatedCall } from './call';
import { waveDtoSchema } from './types/wave';
import parseRes from './utils/parse-res';

export async function getWave(f = fetch, waveId: string) {
  return parseRes(waveDtoSchema, await authenticatedCall(f, `/api/waves/${waveId}`), {
    expect404: true,
  });
}
