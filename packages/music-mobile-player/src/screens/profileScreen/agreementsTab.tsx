import { useCallback } from 'react'

import type { RouteProp } from '@react-navigation/core'
import { useRoute } from '@react-navigation/core'
import { agreementsActions } from '@coliving/web/src/common/store/pages/profile/lineups/agreements/actions'
import {
  getProfileAgreementsLineup,
  getProfileUserHandle
} from '@coliving/web/src/common/store/pages/profile/selectors'

import { Lineup } from 'app/components/lineup'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { isEqual, useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { EmptyProfileTile } from './emptyProfileTile'
import { getIsOwner, useSelectProfile } from './selectors'

export const AgreementsTab = () => {
  const { params } =
    useRoute<RouteProp<{ Agreements: { handle: string } }, 'Agreements'>>()
  const lineup = useSelectorWeb(getProfileAgreementsLineup, isEqual)
  const dispatchWeb = useDispatchWeb()

  const profileHandle = useSelectorWeb(getProfileUserHandle)
  const isOwner = useSelectorWeb(getIsOwner)

  const isProfileLoaded =
    profileHandle === params?.handle ||
    (params?.handle === 'accountUser' && isOwner)

  const { user_id, digital_content_count, _landlord_pick } = useSelectProfile([
    'user_id',
    'digital_content_count',
    '_landlord_pick'
  ])

  // TODO: use fetchPayload (or change Remixes page)
  const loadMore = useCallback(
    (offset: number, limit: number) => {
      dispatchWeb(
        agreementsActions.fetchLineupMetadatas(offset, limit, false, {
          userId: user_id
        })
      )
    },
    [dispatchWeb, user_id]
  )

  /**
   * If the profile isn't loaded yet, pass the lineup an empty entries
   * array so only skeletons are displayed
   */
  return (
    <Lineup
      leadingElementId={_landlord_pick}
      listKey='profile-digital-contents'
      actions={agreementsActions}
      lineup={isProfileLoaded ? lineup : { ...lineup, entries: [] }}
      limit={digital_content_count}
      loadMore={loadMore}
      disableTopTabScroll
      ListEmptyComponent={<EmptyProfileTile tab='agreements' />}
      showsVerticalScrollIndicator={false}
    />
  )
}
