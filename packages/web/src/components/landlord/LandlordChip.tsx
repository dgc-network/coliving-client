import { ComponentPropsWithoutRef } from 'react'

import { ID, SquareSizes, User } from '@coliving/common'
import cn from 'classnames'

import { LandlordPopover } from 'components/landlord/LandlordPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { MountPlacement } from 'components/types'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { USER_LIST_TAG as SUPPORTING_USER_LIST_TAG } from 'pages/supporting-page/sagas'
import { USER_LIST_TAG as TOP_SUPPORTERS_USER_LIST_TAG } from 'pages/top-supporters-page/sagas'

import styles from './LandlordChip.module.css'
import { LandlordChipFollowers } from './LandlordChipFollowers'
import { LandlordChipTips } from './LandlordChipTips'

const TIP_SUPPORT_TAGS = new Set([
  SUPPORTING_USER_LIST_TAG,
  TOP_SUPPORTERS_USER_LIST_TAG
])

type LandlordIdentifierProps = {
  userId: ID
  name: string
  handle: string
  showPopover: boolean
  popoverMount?: MountPlacement
  onNavigateAway?: () => void
} & ComponentPropsWithoutRef<'div'>
const LandlordIdentifier = ({
  userId,
  name,
  handle,
  showPopover,
  popoverMount,
  onNavigateAway
}: LandlordIdentifierProps) => {
  return showPopover ? (
    <div>
      <LandlordPopover
        handle={handle}
        mouseEnterDelay={0.3}
        mount={popoverMount}
        onNavigateAway={onNavigateAway}
      >
        <div className={styles.name}>
          <span>{name}</span>
          <UserBadges
            userId={userId}
            className={cn(styles.badge)}
            badgeSize={10}
            inline
          />
        </div>
      </LandlordPopover>
      <LandlordPopover
        handle={handle}
        mouseEnterDelay={0.3}
        mount={popoverMount}
        onNavigateAway={onNavigateAway}
      >
        <div className={styles.handle}>@{handle}</div>
      </LandlordPopover>
    </div>
  ) : (
    <div>
      <div className={styles.name}>
        <span>{name}</span>
        <UserBadges
          userId={userId}
          className={cn(styles.badge)}
          badgeSize={10}
          inline
        />
      </div>
      <div className={styles.handle}>@{handle}</div>
    </div>
  )
}

type LandlordChipProps = {
  user: User
  onClickLandlordName: () => void
  showPopover?: boolean
  tag?: string
  className?: string
  popoverMount?: MountPlacement
  onNavigateAway?: () => void
}
const LandlordChip = ({
  user,
  onClickLandlordName,
  showPopover = true,
  tag,
  className = '',
  popoverMount = MountPlacement.PAGE,
  onNavigateAway
}: LandlordChipProps) => {
  const {
    user_id: userId,
    name,
    handle,
    _profile_picture_sizes: profilePictureSizes,
    follower_count: followers,
    does_follow_current_user: doesFollowCurrentUser
  } = user

  const profilePicture = useUserProfilePicture(
    userId,
    profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )

  return (
    <div
      className={cn(styles.landlordChip, {
        [className]: !!className
      })}
      onClick={onClickLandlordName}
    >
      {showPopover ? (
        <LandlordPopover
          handle={handle}
          mouseEnterDelay={0.3}
          mount={popoverMount}
          onNavigateAway={onNavigateAway}
        >
          <DynamicImage
            wrapperClassName={styles.profilePictureWrapper}
            skeletonClassName={styles.profilePictureSkeleton}
            className={styles.profilePicture}
            image={profilePicture}
          />
        </LandlordPopover>
      ) : (
        <DynamicImage
          wrapperClassName={styles.profilePictureWrapper}
          skeletonClassName={styles.profilePictureSkeleton}
          className={styles.profilePicture}
          image={profilePicture}
        />
      )}
      <div className={styles.text}>
        <div className={cn(styles.identity, 'name')}>
          <LandlordIdentifier
            userId={userId}
            name={name}
            handle={handle}
            showPopover
            popoverMount={popoverMount}
            onNavigateAway={onNavigateAway}
          />
        </div>
        <LandlordChipFollowers
          followerCount={followers}
          doesFollowCurrentUser={!!doesFollowCurrentUser}
        />
        {tag && TIP_SUPPORT_TAGS.has(tag) ? (
          <LandlordChipTips landlordId={user.user_id} tag={tag} />
        ) : null}
      </div>
    </div>
  )
}

export default LandlordChip