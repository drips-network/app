import formatTokenAmount from '$lib/utils/format-token-amount';
import { get } from 'svelte/store';
import amtDeltaUnitStore, { FRIENDLY_NAMES, MULTIPLIERS } from '../amt-delta-unit.store';

export default function formatAmtPerSec(
  amountWithExtraPrecision: bigint,
  tokenDecimals: number,
  tokenSymbol: string,
) {
  const selectedUnit = get(amtDeltaUnitStore);
  const perSecTimeUnitMultiplier = MULTIPLIERS[selectedUnit];

  const amountToShow = amountWithExtraPrecision * BigInt(perSecTimeUnitMultiplier);
  const formatted = formatTokenAmount(amountToShow, tokenDecimals, undefined, false);

  return `${formatted} ${tokenSymbol}/${FRIENDLY_NAMES[selectedUnit]}`;
}
