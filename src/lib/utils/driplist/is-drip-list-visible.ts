/**
 * Determines whether the Drip List with the given `dripListAccountId` should be visible on the owner's
 * profile.
 * 
 * Whether a Drip List is visible depends on whether the particular list was originally minted by its
 * current owner, and on an (optional) Address Driver metadata key called `visibleDripListAccountIds` 
 * that allows the account holder to control what lists appear on their profile.
 * 
 * When minting a new Drip List, we DON'T explicitly update the `visibleDripListAccountIds` key in order
 * to save gas. Of course, newly-minted Drip Lists should be visible immediately, so we display any Drip Lists
 * minted by the particular account after the last time the `visibleDripListAccountIds` key was updated.
 * 
 * In summary, Drip Lists should be visible on their owner's profiles if:
 * - The Drip List ID is explicitly
 * 
 * @param dripListAccountId 
 * @param visibleDripListAccountIds 
 * @param visibleDripListsLastUpdatedAt 
 */
export default function isDripListVisible(
  ownerAccountId: string,
  dripListAccountId: string,
  visibleDripListAccountIds: string[] | undefined,
  visibleDripListsLastUpdatedAt: Date,
) {

}
