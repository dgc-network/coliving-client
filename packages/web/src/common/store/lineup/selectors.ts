import { LineupState, removeNullable } from '@coliving/common'
import { createSelector } from 'reselect'

import { getAgreementsByUid } from 'common/store/cache/agreements/selectors'
import { getUsers } from 'common/store/cache/users/selectors'

// Some lineups can have additional properties (T)
// e.g. collections have dateAdded in entries
type LineupSelector<T, State> = (state: State) => LineupState<T>

export const getLineupHasAgreements = <T, State>(
  selector: LineupSelector<T, State>,
  state: State
) => {
  const lineup = selector(state)
  return lineup && lineup.entries.length > 0
}

export const makeGetTableMetadatas = <T, State>(
  lineupSelector: LineupSelector<T, State>
) => {
  return createSelector(
    lineupSelector,
    getAgreementsByUid,
    getUsers,
    (lineup, agreementUids, users) => {
      let deleted = lineup.deleted
      const entries = lineup.entries
        .map((entry) => {
          const agreement = agreementUids[entry.uid]
          if (agreement) {
            return {
              ...entry,
              ...agreement,
              uid: entry.uid,
              followeeReposts: agreement.followee_reposts
                .map((repost) => ({ ...repost, user: users[repost.user_id] }))
                .filter((repost) => !!repost.user)
            }
          }

          deleted += 1
          return null
        })
        .filter(removeNullable)
        .map((entry) => {
          if (entry.owner_id in users)
            return { ...entry, user: users[entry.owner_id] }
          deleted += 1
          return null
        })
        .filter(removeNullable)

      return {
        ...lineup,
        deleted,
        entries
      }
    }
  )
}

export const makeGetLineupMetadatas = <T, State>(
  lineupSelector: LineupSelector<T, State>
) => {
  return createSelector([lineupSelector], (lineup) => {
    return lineup
  })
}

export const makeGetLineupOrder = <T, State>(
  lineupSelector: LineupSelector<T, State>
) =>
  createSelector([lineupSelector], (lineup) => {
    return lineup.order
  })
