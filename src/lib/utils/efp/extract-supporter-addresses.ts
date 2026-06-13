import type { SupportersSectionSupportItemFragment } from '$lib/components/supporters-section/__generated__/gql.generated';

export default function extractSupporterAddresses(
  supportItems: SupportersSectionSupportItemFragment[],
): string[] {
  const addresses = new Set<string>();

  for (const item of supportItems) {
    if (item.__typename === 'OneTimeDonationSupport') {
      addresses.add(item.account.address.toLowerCase());
    } else if (item.__typename === 'StreamSupport') {
      addresses.add(item.stream.sender.account.address.toLowerCase());
    }
  }

  return [...addresses];
}
