import { MouseEventHandler, useCallback, useMemo } from 'react'

import { FollowSource, User, FeatureFlags } from '@coliving/common'
import { useDispatch } from 'react-redux'

import { setNotificationSubscription } from 'common/store/pages/profile/actions'
import { followUser, unfollowUser } from 'common/store/social/users/actions'
import FollowButton from 'components/follow-button/FollowButton'
import Stats, { StatProps } from 'components/stats/Stats'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'

import styles from './ArtistCard.module.css'
import { ArtistCardCover } from './ArtistCardCover'
import { ArtistSupporting } from './ArtistSupporting'

type ArtistCardProps = {
  artist: User
  onNavigateAway: () => void
}

export const ArtistCard = (props: ArtistCardProps) => {
  const { artist, onNavigateAway } = props
  const {
    user_id,
    bio,
    agreement_count,
    content list_count,
    follower_count,
    followee_count,
    does_current_user_follow
  } = artist

  const dispatch = useDispatch()
  const isArtist = agreement_count > 0
  const isTippingEnabled = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)

  const handleClick: MouseEventHandler = useCallback((event) => {
    event.stopPropagation()
  }, [])

  const stats = useMemo((): StatProps[] => {
    if (isArtist) {
      return [
        {
          number: agreement_count,
          title: agreement_count === 1 ? 'agreement' : 'agreements',
          key: 'agreement'
        },
        {
          number: follower_count,
          title: follower_count === 1 ? 'follower' : 'followers',
          key: 'follower'
        },
        { number: followee_count, title: 'following', key: 'following' }
      ]
    }
    return [
      {
        number: content list_count,
        title: content list_count === 1 ? 'content list' : 'content lists',
        key: 'content list'
      },
      {
        number: follower_count,
        title: follower_count === 1 ? 'follower' : 'followers',
        key: 'follower'
      },
      { number: followee_count, title: 'following', key: 'following' }
    ]
  }, [isArtist, agreement_count, follower_count, followee_count, content list_count])

  const handleFollow = useCallback(() => {
    dispatch(followUser(user_id, FollowSource.HOVER_TILE))
  }, [dispatch, user_id])

  const handleUnfollow = useCallback(() => {
    dispatch(unfollowUser(user_id, FollowSource.HOVER_TILE))
    dispatch(setNotificationSubscription(user_id, false, true))
  }, [dispatch, user_id])

  return (
    <div className={styles.popoverContainer} onClick={handleClick}>
      <div className={styles.artistCardContainer}>
        <ArtistCardCover
          artist={artist}
          isArtist={isArtist}
          onNavigateAway={onNavigateAway}
        />
        <div className={styles.artistStatsContainer}>
          <Stats
            userId={user_id}
            stats={stats}
            clickable={false}
            size='medium'
          />
        </div>
        <div className={styles.contentContainer}>
          <div>
            {isTippingEnabled ? (
              <ArtistSupporting
                artist={artist}
                onNavigateAway={onNavigateAway}
              />
            ) : null}
            <div className={styles.description}>{bio}</div>
            <FollowButton
              className={styles.followButton}
              following={does_current_user_follow}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              stopPropagation
            />
          </div>
        </div>
      </div>
    </div>
  )
}
