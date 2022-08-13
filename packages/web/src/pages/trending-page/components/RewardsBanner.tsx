import { useCallback } from 'react'

import { IconArrow, IconCrown } from '@coliving/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import {
  setTrendingRewardsModalType,
  TrendingRewardsModalType
} from 'common/store/pages/audio-rewards/slice'
import { isMobile } from 'utils/clientUtil'

import styles from './RewardsBanner.module.css'

const messages = {
  rewards: '$LIVE REWARDS',
  tracksDescription: 'TOP 5 TRACKS EACH WEEK WIN $LIVE',
  playlistsDescription: 'TOP 5 PLAYLISTS EACH WEEK WIN $LIVE',
  undergroundDescription: 'TOP 5 TRACKS EACH WEEK WIN $LIVE',
  learnMore: 'LEARN MORE'
}

const messageMap = {
  tracks: {
    description: messages.tracksDescription
  },
  playlists: {
    description: messages.playlistsDescription
  },
  underground: {
    description: messages.undergroundDescription
  }
}

type RewardsBannerProps = {
  bannerType: 'tracks' | 'playlists' | 'underground'
}

const useHandleBannerClick = () => {
  const [, setModal] = useModalState('TrendingRewardsExplainer')
  const dispatch = useDispatch()
  const onClickBanner = useCallback(
    (modalType: TrendingRewardsModalType) => {
      setModal(true)
      dispatch(setTrendingRewardsModalType({ modalType }))
    },
    [dispatch, setModal]
  )
  return onClickBanner
}

const RewardsBanner = ({ bannerType }: RewardsBannerProps) => {
  const mobile = isMobile()
  const mobileStyle = { [styles.mobile]: mobile }
  const onClick = useHandleBannerClick()

  return (
    <div
      className={cn(cn(styles.container, mobileStyle))}
      onClick={() => onClick(bannerType)}
    >
      <div className={cn(styles.rewardsText, mobileStyle)}>
        <div className={styles.iconCrown}>
          <IconCrown />
        </div>
        {messages.rewards}
      </div>
      <span className={styles.descriptionText}>
        {messageMap[bannerType].description}
      </span>
      {!mobile && (
        <div className={styles.learnMore}>
          {messages.learnMore}
          <IconArrow />
        </div>
      )}
    </div>
  )
}

export default RewardsBanner
