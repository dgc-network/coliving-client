import { StringKeys } from '@coliving/common'
import type { TrendingRewardID } from '@coliving/common'
import type { TrendingRewardsModalType } from '@coliving/web/src/common/store/pages/live-rewards/slice'
import { setTrendingRewardsModalType } from '@coliving/web/src/common/store/pages/live-rewards/slice'
import type { Modals } from '@coliving/web/src/common/store/ui/modals/slice'
import { setVisibility } from '@coliving/web/src/common/store/ui/modals/slice'
import { View } from 'react-native'

import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useRemoteVar } from 'app/hooks/useRemoteConfig'
import { makeStyles } from 'app/styles'
import { trendingRewardsConfig } from 'app/utils/challenges'

import { Panel } from './Panel'

const validRewardIds: Set<TrendingRewardID> = new Set([
  'trending-agreement',
  'trending-content-list',
  'top-api',
  'verified-upload',
  'trending-underground'
])

/** Pulls rewards from remoteconfig */
const useRewardIds = () => {
  const rewardsString = useRemoteVar(StringKeys.TRENDING_REWARD_IDS)
  if (!rewardsString) return []
  const rewards = rewardsString.split(',') as TrendingRewardID[]
  const filteredRewards: TrendingRewardID[] = rewards.filter((reward) =>
    validRewardIds.has(reward)
  )
  return filteredRewards
}

const useStyles = makeStyles(() => ({
  root: {}
}))

export const TrendingRewards = () => {
  const styles = useStyles()
  const dispatchWeb = useDispatchWeb()

  const rewardIds = useRewardIds()

  const openModal = (trendingRewardId: TrendingRewardID) => {
    let modal: Modals
    let modalType: TrendingRewardsModalType | null = null
    switch (trendingRewardId) {
      case 'top-api':
        modal = 'APIRewardsExplainer'
        break
      case 'trending-content-list':
        modal = 'TrendingRewardsExplainer'
        modalType = 'contentLists'
        break
      case 'trending-agreement':
        modal = 'TrendingRewardsExplainer'
        modalType = 'agreements'
        break
      case 'trending-underground':
        modal = 'TrendingRewardsExplainer'
        modalType = 'underground'
        break
      case 'verified-upload':
        // Deprecated trending challenge
        return
    }
    if (modalType) {
      dispatchWeb(setTrendingRewardsModalType({ modalType }))
    }
    dispatchWeb(setVisibility({ modal, visible: true }))
  }

  const rewardsPanels = rewardIds.map((id) => {
    const props = trendingRewardsConfig[id]
    return <Panel {...props} onPress={() => openModal(id)} key={props.title} />
  })
  return <View style={styles.root}>{rewardsPanels}</View>
}
