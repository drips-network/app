import getManualRecipient from '../get-manual-recipient';

const DRIP_LIST_ID = '41305178594442616889778610143373288091511468151140966646158126636698';
const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe('getManualRecipient', () => {
  it('returns the resolved Drip List account ID, not the Drip List URL the user entered', () => {
    expect(
      getManualRecipient(
        {
          recipientInputValue: `https://drips.network/app/drip-lists/${DRIP_LIST_ID}`,
          recipientValidatedValue: DRIP_LIST_ID,
        },
        { type: 'valid' },
      ),
    ).toEqual({ type: 'drip-list', accountId: DRIP_LIST_ID });
  });

  it('returns the resolved address, not the ENS name the user entered', () => {
    expect(
      getManualRecipient(
        { recipientInputValue: 'vitalik.eth', recipientValidatedValue: ADDRESS },
        { type: 'valid' },
      ),
    ).toEqual({ type: 'address', address: ADDRESS });
  });

  it('returns undefined if there is no resolved recipient', () => {
    expect(
      getManualRecipient(
        { recipientInputValue: 'vitalik.eth', recipientValidatedValue: undefined },
        { type: 'valid' },
      ),
    ).toBeUndefined();
  });

  it('returns undefined if the input is not valid', () => {
    for (const type of ['unvalidated', 'pending'] as const) {
      expect(
        getManualRecipient(
          { recipientInputValue: ADDRESS, recipientValidatedValue: ADDRESS },
          { type },
        ),
      ).toBeUndefined();
    }

    expect(
      getManualRecipient(
        { recipientInputValue: ADDRESS, recipientValidatedValue: ADDRESS },
        { type: 'invalid', message: 'You cannot use this address.' },
      ),
    ).toBeUndefined();
  });
});
