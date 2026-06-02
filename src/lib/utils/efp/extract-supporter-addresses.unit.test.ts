import extractSupporterAddresses from './extract-supporter-addresses';
import type { SupportersSectionSupportItemFragment } from '$lib/components/supporters-section/__generated__/gql.generated';

describe('extractSupporterAddresses', () => {
  it('collects unique lowercase addresses from donations and streams', () => {
    const supportItems = [
      {
        __typename: 'OneTimeDonationSupport',
        account: { address: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      },
      {
        __typename: 'StreamSupport',
        stream: {
          sender: { account: { address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' } },
        },
      },
      {
        __typename: 'OneTimeDonationSupport',
        account: { address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
      },
    ] as SupportersSectionSupportItemFragment[];

    expect(extractSupporterAddresses(supportItems)).toEqual([
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ]);
  });

  it('ignores unsupported support item types', () => {
    const supportItems = [
      { __typename: 'UnsupportedSupport' },
    ] as SupportersSectionSupportItemFragment[];

    expect(extractSupporterAddresses(supportItems)).toEqual([]);
  });
});
